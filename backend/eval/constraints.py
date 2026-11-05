"""Do a prompt's requirements survive compression? A benchmark, not a unit test.

Runs several compression methods over prompts that carry machine-checkable
constraints and counts how many constraints are still stated afterwards. No API
key and no model call: only the compressors run.

    python -m eval.constraints                       # IFEval + IFBench, every method
    python -m eval.constraints --dataset ifbench     # one dataset
    python -m eval.constraints --methods lingua-unguarded,lingua-guarded --rate 0.4
    python -m eval.constraints --out eval/results-constraints.md

Data (Apache-2.0, downloaded on first use into eval/data/):
  IFEval  https://github.com/google-research/google-research/tree/master/instruction_following_eval
  IFBench https://github.com/allenai/IFBench

Held-out discipline: contract.py was tuned by reading IFEval failures, so IFEval
is reported as *tuned on*. IFBench is split by position into a dev half (even
rows, which may be inspected and tuned on) and a test half (odd rows, which are
only ever counted).
"""

import argparse
import statistics
import time
from collections import Counter
from contextlib import contextmanager
from pathlib import Path

import requests

from app import config
from app.engine import compressor
from app.engine.optimizer import compress
from app.engine.tokenizer import count_tokens
from eval import survival

HERE = Path(__file__).parent
DATA = HERE / "data"

DATASETS = {
    "ifeval": "https://raw.githubusercontent.com/google-research/google-research/master/instruction_following_eval/data/input_data.jsonl",
    "ifbench": "https://raw.githubusercontent.com/allenai/IFBench/main/data/IFBench_test.jsonl",
}
# name -> (dataset, which rows, how it should be read)
SPLITS = {
    "ifeval": ("ifeval", lambda i: True, "tuned on"),
    "ifbench-dev": ("ifbench", lambda i: i % 2 == 0, "dev: may be inspected"),
    "ifbench-test": ("ifbench", lambda i: i % 2 == 1, "held out: counted only"),
}


@contextmanager
def settings(**values):
    """Set config values for a block, then restore them."""
    old = {k: getattr(config, k) for k in values}
    for k, v in values.items():
        setattr(config, k, v)
    try:
        yield
    finally:
        for k, v in old.items():
            setattr(config, k, v)


def naive_lingua(prompt: str) -> str:
    """LLMLingua-2 as `pip install llmlingua` ships it: no rules, no force-list."""
    with compressor._lock:
        result = compressor._model().compress_prompt(prompt, rate=config.COMPRESSION_RATE, drop_consecutive=True)
    return result["compressed_prompt"]


# name -> (description, settings, function)
METHODS = {
    "rules": ("filler removal only", dict(COMPRESSOR="rules", CONTRACT_GUARD=False), lambda p: compress(p).text),
    "lingua-naive": ("LLMLingua-2 with no guard rails", dict(COMPRESSOR="auto"), naive_lingua),
    "lingua-unguarded": ("rules + LLMLingua-2, static force-list",
                         dict(COMPRESSOR="auto", CONTRACT_GUARD=False), lambda p: compress(p).text),
    "lingua-guarded": ("rules + LLMLingua-2 held to the contract (default)",
                       dict(COMPRESSOR="auto", CONTRACT_GUARD=True), lambda p: compress(p).text),
}


def load(dataset: str) -> list[dict]:
    import json

    path = DATA / f"{dataset}.jsonl"
    if not path.exists():
        DATA.mkdir(exist_ok=True)
        print(f"Downloading {dataset} ...")
        response = requests.get(DATASETS[dataset], timeout=60)
        response.raise_for_status()
        path.write_bytes(response.content)
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def run_method(name: str, prompts: list[str], rate: float) -> tuple[list[str], list[float]]:
    _, overrides, fn = METHODS[name]
    outputs, ms = [], []
    with settings(COMPRESSION_RATE=rate, **overrides):
        for prompt in prompts:
            start = time.perf_counter()
            outputs.append(fn(prompt))
            ms.append((time.perf_counter() - start) * 1000)
    return outputs, ms


def score(rows: list[dict], outputs: list[str], ms: list[float]) -> dict:
    original_tokens = sum(count_tokens(r["prompt"]) for r in rows)
    saved = original_tokens - sum(count_tokens(o) for o in outputs)
    checked = kept = prompts_checked = prompts_intact = negations = 0
    failures: Counter = Counter()
    for row, out in zip(rows, outputs):
        results = survival.check(row["prompt"], out, row)
        checked += len(results)
        kept += sum(ok for _, ok in results)
        if results:
            prompts_checked += 1
            prompts_intact += all(ok for _, ok in results)
        failures.update(i for i, ok in results if not ok)
        negations += survival.lost_negation(row["prompt"], out)
    return {
        "saved_pct": saved / original_tokens * 100,
        "instructions_kept_pct": kept / checked * 100 if checked else 100.0,
        "prompts_intact_pct": prompts_intact / prompts_checked * 100 if prompts_checked else 100.0,
        "negation_lost": negations,
        "mean_ms": statistics.mean(ms),
        "instructions": checked,
        "failures": failures,
    }


def render(results: dict, rate: float) -> str:
    lines = [f"# Constraint survival under compression (LLMLingua-2 keeps {rate:.0%})", ""]
    for split, (rows_n, how, scores) in results.items():
        lines += [f"## {split}: {rows_n} prompts, {next(iter(scores.values()))['instructions']} checkable instructions ({how})", "",
                  "| Method | Tokens saved | Prompts with every requirement intact | Instructions kept | Prompts that lost a negation |",
                  "|---|---:|---:|---:|---:|"]
        for name, s in scores.items():
            lines.append(
                f"| {name} | {s['saved_pct']:.1f}% | {s['prompts_intact_pct']:.1f}% | "
                f"{s['instructions_kept_pct']:.1f}% | {s['negation_lost']} |"
            )
        for name in ("lingua-unguarded", "lingua-guarded"):
            if name in scores and scores[name]["failures"]:
                top = ", ".join(f"`{i}` ×{n}" for i, n in scores[name]["failures"].most_common(5))
                lines.append(f"\nMost-lost instructions, {name}: {top}")
        lines.append("")
    lines += [
        "*Intact* = every checkable instruction in the prompt is still stated after compression (checked from the "
        "benchmark's labels, not from `contract.py`). It shows a requirement is still *there*, not that a model "
        "obeys it. Prompts the guard declines to compress count as intact and as 0 tokens saved.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dataset", choices=["ifeval", "ifbench", "all"], default="all")
    parser.add_argument("--methods", default=",".join(METHODS), help=f"comma-separated, from: {', '.join(METHODS)}")
    parser.add_argument("--rate", type=float, default=0.6, help="fraction of tokens LLMLingua-2 keeps")
    parser.add_argument("--limit", type=int, help="only the first N prompts of each split (quick check)")
    parser.add_argument("--out", type=Path, help="write a markdown report here")
    args = parser.parse_args()

    methods = [m.strip() for m in args.methods.split(",") if m.strip()]
    unknown = [m for m in methods if m not in METHODS]
    if unknown:
        raise SystemExit(f"Unknown method(s): {', '.join(unknown)}")
    if not compressor.enabled() and any(m.startswith("lingua") for m in methods):
        config.COMPRESSOR = "auto"
        if not compressor.enabled():
            raise SystemExit("llmlingua is not installed: pip install -r requirements-lingua.txt")
    compressor.warm_up()

    results = {}
    for split, (dataset, keep, how) in SPLITS.items():
        if args.dataset not in ("all", dataset):
            continue
        rows = [r for i, r in enumerate(load(dataset)) if keep(i)][: args.limit]
        prompts = [r["prompt"] for r in rows]
        scores = {}
        for name in methods:
            outputs, ms = run_method(name, prompts, args.rate)
            scores[name] = score(rows, outputs, ms)
            s = scores[name]
            print(f"{split:13} {name:17} saved {s['saved_pct']:5.1f}%  intact {s['prompts_intact_pct']:5.1f}%  "
                  f"kept {s['instructions_kept_pct']:5.1f}%  neg-lost {s['negation_lost']}")
        results[split] = (len(rows), how, scores)

    report = render(results, args.rate)
    if args.out:
        args.out.write_text(report, encoding="utf-8")
        print(f"\nWrote {args.out}")


if __name__ == "__main__":
    main()
