# Constraint survival under compression (LLMLingua-2 keeps 60%)

## ifeval: 541 prompts, 710 checkable instructions (tuned on)

| Method | Tokens saved | Prompts with every requirement intact | Instructions kept | Prompts that lost a negation |
|---|---:|---:|---:|---:|
| rules | 1.2% | 98.4% | 98.9% | 0 |
| lingua-naive | 41.6% | 76.4% | 83.1% | 71 |
| lingua-unguarded | 29.2% | 83.1% | 87.9% | 10 |
| lingua-guarded | 13.2% | 99.2% | 99.4% | 0 |

Most-lost instructions, lingua-unguarded: `combination:repeat_prompt` ×39, `startend:end_checker` ×18, `combination:two_responses` ×11, `detectable_content:postscript` ×5, `detectable_format:constrained_response` ×5

Most-lost instructions, lingua-guarded: `detectable_content:postscript` ×3, `detectable_format:constrained_response` ×1

## ifbench-dev: 150 prompts, 70 checkable instructions (dev: may be inspected)

| Method | Tokens saved | Prompts with every requirement intact | Instructions kept | Prompts that lost a negation |
|---|---:|---:|---:|---:|
| rules | 0.9% | 98.4% | 98.6% | 0 |
| lingua-naive | 41.7% | 87.3% | 88.6% | 11 |
| lingua-unguarded | 36.1% | 92.1% | 92.9% | 1 |
| lingua-guarded | 29.8% | 100.0% | 100.0% | 0 |

Most-lost instructions, lingua-unguarded: `repeat:repeat_change` ×2, `format:options` ×2, `repeat:repeat_span` ×1

## ifbench-test: 150 prompts, 66 checkable instructions (held out: counted only)

| Method | Tokens saved | Prompts with every requirement intact | Instructions kept | Prompts that lost a negation |
|---|---:|---:|---:|---:|
| rules | 0.9% | 100.0% | 100.0% | 0 |
| lingua-naive | 43.7% | 85.2% | 86.4% | 18 |
| lingua-unguarded | 37.1% | 88.5% | 89.4% | 3 |
| lingua-guarded | 30.7% | 96.7% | 97.0% | 0 |

Most-lost instructions, lingua-unguarded: `words:keywords_specific_position` ×2, `format:options` ×2, `repeat:repeat_span` ×2, `repeat:repeat_change` ×1

Most-lost instructions, lingua-guarded: `words:keywords_specific_position` ×2

*Intact* = every checkable instruction in the prompt is still stated after compression (checked from the benchmark's labels, not from `contract.py`). It shows a requirement is still *there*, not that a model obeys it. Prompts the guard declines to compress count as intact and as 0 tokens saved.
