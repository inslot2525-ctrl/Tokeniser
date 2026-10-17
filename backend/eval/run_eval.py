"""Measure what the optimizer actually buys you.

For each prompt in prompts.jsonl:
  1. Rewrite it once (the same call /smart-optimize makes).
  2. Record prompt tokens saved AND the tokens the rewrite call cost.
  3. With --quality, answer both the original and the rewritten prompt with
     Gemini and have a judge compare the two answers blind (order randomised),
     to check the rewrite didn't lose meaning.

Usage (from backend/):
    python -m eval.run_eval --compressor rules    # rule-based filler removal; no API key needed
    python -m eval.run_eval --compressor lingua   # rules + local LLMLingua-2; no API key needed
    python -m eval.run_eval --compressor llm      # LLM rewrite; needs GEMINI_API_KEY or Ollama
    python -m eval.run_eval --quality             # + answer-quality comparison (needs GEMINI_API_KEY)
    python -m eval.run_eval --out eval/results.md
"""

import argparse
import json
import random
import re
import statistics
import time
from pathlib import Path

from app import config
from app.engine import compressor, llm
from app.engine.optimizer import rewrite_with_metrics

HERE = Path(__file__).parent

JUDGE = """Two AI answers respond to the same request. Decide which answer better
fulfils the ORIGINAL request, including every constraint it states.

<request>
{request}
</request>

<answer_a>
{a}
</answer_a>

<answer_b>
{b}
</answer_b>

Reply with exactly one word: A, B, or TIE."""


def compare(original_prompt: str, rewritten_prompt: str, rng: random.Random) -> str:
    """Returns 'rewrite_better', 'original_better' or 'tie'."""
    original_answer = llm.gemini_generate(original_prompt).text
    rewritten_answer = llm.gemini_generate(rewritten_prompt).text

    swapped = rng.random() < 0.5
    a, b = (rewritten_answer, original_answer) if swapped else (original_answer, rewritten_answer)
    verdict = llm.gemini_generate(JUDGE.format(request=original_prompt, a=a, b=b)).text
    choice = (re.findall(r"\b(A|B|TIE)\b", verdict.upper()) or ["TIE"])[0]

    if choice == "TIE":
        return "tie"
    rewrite_won = (choice == "A") == swapped
    return "rewrite_better" if rewrite_won else "original_better"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--quality", action="store_true", help="also compare answer quality")
    parser.add_argument("--out", type=Path, help="write a markdown report here")
    parser.add_argument("--seed", type=int, default=0)
    parser.add_argument(
        "--compressor", choices=["auto", "rules", "lingua", "llm"], default=None,
        help="override COMPRESSOR: rules, lingua (rules + LLMLingua-2), llm (LLM rewrite)",
    )
    args = parser.parse_args()

    if args.compressor:
        config.COMPRESSOR = args.compressor
    if config.COMPRESSOR == "lingua" and not compressor.enabled():
        raise SystemExit("llmlingua is not installed: pip install -r requirements-lingua.txt")
    if config.COMPRESSOR == "llm":
        method = "LLM rewrite"
    elif compressor.enabled():
        method = f"Rules + {compressor.NAME}"
    else:
        method = "Rules"
    compressor.warm_up()  # keep model loading out of the latency numbers

    rng = random.Random(args.seed)
    rows = []
    for line in (HERE / "prompts.jsonl").read_text(encoding="utf-8").splitlines():
        case = json.loads(line)
        start = time.perf_counter()
        m = rewrite_with_metrics(case["prompt"], "optimize")
        row = {
            "id": case["id"],
            "original": m["original_tokens"],
            "optimized": m["optimized_tokens"],
            "saved_pct": m["savings_percent"],
            "overhead": m["overhead_tokens"],
            "net": m["saved_tokens"] - m["overhead_tokens"],
            "ms": round((time.perf_counter() - start) * 1000),
            "output": m["optimized"],
        }
        if args.quality:
            row["quality"] = compare(case["prompt"], m["optimized"], rng)
        rows.append(row)
        print(json.dumps(row))

    report = render(rows, args.quality, method)
    print("\n" + report)
    if args.out:
        args.out.write_text(report, encoding="utf-8")


def break_even(overhead: int, saved: int) -> str:
    if saved <= 0:
        return "Break-even: never (no tokens saved)"
    if overhead == 0:
        return "Break-even: first use (compression spends no API tokens)"
    return f"Break-even reuse count: {overhead / saved:.1f}x"


def render(rows: list[dict], quality: bool, method: str) -> str:
    total_orig = sum(r["original"] for r in rows)
    total_saved = sum(r["original"] - r["optimized"] for r in rows)
    total_overhead = sum(r["overhead"] for r in rows)
    lines = [
        f"Method: {method}",
        f"Prompts: {len(rows)}",
        f"Mean prompt-token reduction: {statistics.mean(r['saved_pct'] for r in rows):.1f}%",
        f"Median prompt-token reduction: {statistics.median(r['saved_pct'] for r in rows):.1f}%",
        f"Total prompt tokens saved: {total_saved} of {total_orig}",
        f"Total rewrite overhead: {total_overhead} tokens",
        f"Net tokens for a single use: {total_saved - total_overhead}",
        break_even(total_overhead, total_saved),
        f"Median latency: {statistics.median(r['ms'] for r in rows)} ms",
    ]
    if quality:
        outcomes = [r["quality"] for r in rows]
        lines.append(
            "Answer quality (rewrite vs original): "
            f"{outcomes.count('rewrite_better')} better, {outcomes.count('tie')} tie, "
            f"{outcomes.count('original_better')} worse"
        )

    header = "| id | original | optimized | saved % | overhead | net | ms |" + (" quality |" if quality else "")
    sep = "|---|---:|---:|---:|---:|---:|---:|" + ("---|" if quality else "")
    table = [header, sep] + [
        f"| {r['id']} | {r['original']} | {r['optimized']} | {r['saved_pct']} | {r['overhead']} | {r['net']} | {r['ms']} |"
        + (f" {r['quality']} |" if quality else "")
        for r in rows
    ]
    samples = [
        f"**{r['id']}**\n\n```\n{r['output']}\n```" for r in rows if r["id"].startswith("verbose")
    ][:3]
    return "\n".join([
        "## Summary", "", *[f"- {l}" for l in lines], "",
        "## Per prompt", "", *table, "",
        "## Sample outputs", "", *samples,
    ]) + "\n"


if __name__ == "__main__":
    main()
