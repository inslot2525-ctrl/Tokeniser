"""Measure what the optimizer actually buys you.

For each prompt in prompts.jsonl:
  1. Rewrite it once (the same call /smart-optimize makes).
  2. Record prompt tokens saved AND the tokens the rewrite call cost.
  3. With --quality, answer both the original and the rewritten prompt with
     Gemini and have a judge compare the two answers blind (order randomised),
     to check the rewrite didn't lose meaning.

Usage (from backend/, with GEMINI_API_KEY set):
    python -m eval.run_eval              # token metrics only
    python -m eval.run_eval --quality    # + answer-quality comparison
    python -m eval.run_eval --out eval/results.md
"""

import argparse
import json
import random
import re
import statistics
from pathlib import Path

from app.engine import llm
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
    args = parser.parse_args()

    rng = random.Random(args.seed)
    rows = []
    for line in (HERE / "prompts.jsonl").read_text(encoding="utf-8").splitlines():
        case = json.loads(line)
        m = rewrite_with_metrics(case["prompt"], "optimize")
        row = {
            "id": case["id"],
            "original": m["original_tokens"],
            "optimized": m["optimized_tokens"],
            "saved_pct": m["savings_percent"],
            "overhead": m["overhead_tokens"],
            "net": m["saved_tokens"] - m["overhead_tokens"],
        }
        if args.quality:
            row["quality"] = compare(case["prompt"], m["optimized"], rng)
        rows.append(row)
        print(json.dumps(row))

    report = render(rows, args.quality)
    print("\n" + report)
    if args.out:
        args.out.write_text(report, encoding="utf-8")


def render(rows: list[dict], quality: bool) -> str:
    total_orig = sum(r["original"] for r in rows)
    total_saved = sum(r["original"] - r["optimized"] for r in rows)
    total_overhead = sum(r["overhead"] for r in rows)
    lines = [
        f"Prompts: {len(rows)}",
        f"Mean prompt-token reduction: {statistics.mean(r['saved_pct'] for r in rows):.1f}%",
        f"Median prompt-token reduction: {statistics.median(r['saved_pct'] for r in rows):.1f}%",
        f"Total prompt tokens saved: {total_saved} of {total_orig}",
        f"Total rewrite overhead: {total_overhead} tokens",
        f"Net tokens for a single use: {total_saved - total_overhead}",
        f"Break-even reuse count: {total_overhead / total_saved:.1f}x" if total_saved > 0 else "Break-even: never",
    ]
    if quality:
        outcomes = [r["quality"] for r in rows]
        lines.append(
            "Answer quality (rewrite vs original): "
            f"{outcomes.count('rewrite_better')} better, {outcomes.count('tie')} tie, "
            f"{outcomes.count('original_better')} worse"
        )

    header = "| id | original | optimized | saved % | overhead | net |" + (" quality |" if quality else "")
    sep = "|---|---:|---:|---:|---:|---:|" + ("---|" if quality else "")
    table = [header, sep] + [
        f"| {r['id']} | {r['original']} | {r['optimized']} | {r['saved_pct']} | {r['overhead']} | {r['net']} |"
        + (f" {r['quality']} |" if quality else "")
        for r in rows
    ]
    return "\n".join(["## Summary", "", *[f"- {l}" for l in lines], "", "## Per prompt", "", *table]) + "\n"


if __name__ == "__main__":
    main()
