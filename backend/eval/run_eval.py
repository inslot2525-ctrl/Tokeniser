"""Measure what compression saves, and (optionally) whether it hurts answers.

For each prompt in prompts.jsonl:
  1. Compress it (what /compress and /agent do).
  2. Record tokens before and after, and how long it took.
  3. With --quality: answer the original and the compressed prompt with
     Gemini, then have Gemini judge the two answers blind (order randomised)
     against the ORIGINAL request.

Usage (from backend/):
    python -m eval.run_eval --compressor rules                 # no API key needed
    python -m eval.run_eval --compressor lingua                # rules + LLMLingua-2, no key needed
    python -m eval.run_eval --compressor lingua --quality      # needs GEMINI_API_KEY in the environment
    python -m eval.run_eval --out eval/results.md              # also write a markdown report
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
from app.engine.optimizer import compress_with_metrics

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


def compare(original: str, compressed: str, rng: random.Random) -> str:
    """Returns 'compressed_better', 'original_better' or 'tie'."""
    if compressed == original:
        return "tie"  # nothing was removed, so the answers would be the same
    original_answer = llm.gemini_generate(original).text
    compressed_answer = llm.gemini_generate(compressed).text

    # Randomise the order so the judge can't favour a position.
    swapped = rng.random() < 0.5
    a, b = (compressed_answer, original_answer) if swapped else (original_answer, compressed_answer)
    verdict = llm.gemini_generate(JUDGE.format(request=original, a=a, b=b)).text
    choice = (re.findall(r"\b(A|B|TIE)\b", verdict.upper()) or ["TIE"])[0]

    if choice == "TIE":
        return "tie"
    compressed_won = (choice == "A") == swapped
    return "compressed_better" if compressed_won else "original_better"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--compressor", choices=["rules", "lingua"], default=None,
                        help="rules only, or rules + LLMLingua-2 (default: whatever is installed)")
    parser.add_argument("--quality", action="store_true", help="also compare answer quality")
    parser.add_argument("--out", type=Path, help="write a markdown report here")
    parser.add_argument("--seed", type=int, default=0)
    args = parser.parse_args()

    if args.compressor:
        config.COMPRESSOR = args.compressor
    if config.COMPRESSOR == "lingua" and not compressor.enabled():
        raise SystemExit("llmlingua is not installed: pip install -r requirements-lingua.txt")
    if args.quality and not config.GEMINI_API_KEY:
        raise SystemExit("--quality needs GEMINI_API_KEY set in the environment or backend/.env")
    compressor.warm_up()  # keep model loading out of the latency numbers

    rng = random.Random(args.seed)
    rows = []
    for line in (HERE / "prompts.jsonl").read_text(encoding="utf-8").splitlines():
        case = json.loads(line)
        start = time.perf_counter()
        m = compress_with_metrics(case["prompt"])
        row = {
            "id": case["id"],
            "original": m["original_tokens"],
            "optimized": m["optimized_tokens"],
            "saved_pct": m["savings_percent"],
            "ms": round((time.perf_counter() - start) * 1000),
            "method": m["method"],
            "output": m["optimized"],
        }
        if args.quality:
            row["quality"] = compare(case["prompt"], m["optimized"], rng)
        rows.append(row)
        print(json.dumps({k: v for k, v in row.items() if k != "output"}))

    report = render(rows, args.quality)
    print("\n" + report)
    if args.out:
        args.out.write_text(report, encoding="utf-8")


def render(rows: list[dict], quality: bool) -> str:
    total_orig = sum(r["original"] for r in rows)
    total_saved = sum(r["original"] - r["optimized"] for r in rows)
    method = "Rules + LLMLingua-2" if compressor.enabled() else "Rules"
    lines = [
        f"Method: {method}",
        f"Prompts: {len(rows)}",
        f"Total tokens saved: {total_saved} of {total_orig} ({total_saved / total_orig * 100:.1f}%)",
        f"Mean / median reduction per prompt: "
        f"{statistics.mean(r['saved_pct'] for r in rows):.1f}% / {statistics.median(r['saved_pct'] for r in rows):.1f}%",
        "API tokens spent on compression: 0",
        f"Median latency: {statistics.median(r['ms'] for r in rows)} ms",
    ]
    if quality:
        q = [r["quality"] for r in rows]
        lines.append(
            "Answer quality, compressed vs original: "
            f"{q.count('compressed_better')} better, {q.count('tie')} tie, {q.count('original_better')} worse"
        )

    header = "| id | original | compressed | saved % | ms |" + (" quality |" if quality else "")
    sep = "|---|---:|---:|---:|---:|" + ("---|" if quality else "")
    table = [header, sep] + [
        f"| {r['id']} | {r['original']} | {r['optimized']} | {r['saved_pct']} | {r['ms']} |"
        + (f" {r['quality']} |" if quality else "")
        for r in rows
    ]
    samples = [f"**{r['id']}**\n\n```\n{r['output']}\n```" for r in rows if r["id"].startswith(("verbose", "constraint"))][:4]
    return "\n".join([
        "## Summary", "", *[f"- {l}" for l in lines], "",
        "## Per prompt", "", *table, "",
        "## Sample outputs", "", *samples,
    ]) + "\n"


if __name__ == "__main__":
    main()
