## Summary

- Method: LLMLingua-2
- Prompts: 20
- Mean prompt-token reduction: 31.4%
- Median prompt-token reduction: 39.7%
- Total prompt tokens saved: 419 of 1065
- Total rewrite overhead: 0 tokens
- Net tokens for a single use: 419
- Break-even: first use (compression spends no API tokens)
- Median latency: 537.5 ms

## Per prompt

| id | original | optimized | saved % | overhead | net | ms |
|---|---:|---:|---:|---:|---:|---:|
| verbose-1 | 65 | 34 | 47.69 | 0 | 31 | 600 |
| verbose-2 | 66 | 37 | 43.94 | 0 | 29 | 557 |
| verbose-3 | 64 | 35 | 45.31 | 0 | 29 | 522 |
| verbose-4 | 67 | 39 | 41.79 | 0 | 28 | 524 |
| verbose-5 | 86 | 54 | 37.21 | 0 | 32 | 537 |
| verbose-6 | 71 | 39 | 45.07 | 0 | 32 | 592 |
| verbose-7 | 66 | 39 | 40.91 | 0 | 27 | 539 |
| verbose-8 | 64 | 39 | 39.06 | 0 | 25 | 549 |
| verbose-9 | 94 | 61 | 35.11 | 0 | 33 | 531 |
| verbose-10 | 73 | 41 | 43.84 | 0 | 32 | 526 |
| concise-1 | 8 | 8 | 0.0 | 0 | 0 | 0 |
| concise-2 | 10 | 10 | 0.0 | 0 | 0 | 0 |
| concise-3 | 16 | 16 | 0.0 | 0 | 0 | 0 |
| concise-4 | 11 | 11 | 0.0 | 0 | 0 | 0 |
| concise-5 | 12 | 12 | 0.0 | 0 | 0 | 0 |
| constraint-1 | 54 | 33 | 38.89 | 0 | 21 | 541 |
| constraint-2 | 52 | 28 | 46.15 | 0 | 24 | 552 |
| constraint-3 | 60 | 36 | 40.0 | 0 | 24 | 539 |
| hard-1 | 66 | 40 | 39.39 | 0 | 26 | 538 |
| hard-2 | 60 | 34 | 43.33 | 0 | 26 | 540 |

## Sample outputs

**verbose-1**

```
Hi there! hope you're doing well. wondering if possibly help me something. explain, difference between process and thread in operating system. Thank you in advance, appreciate it!
```
**verbose-2**

```
please, if not much trouble, write me Python function takes list of numbers returns new list only even numbers? appreciate if code clean well documented handles empty list properly. Thanks a lot!
```
**verbose-3**

```
I want to know, thinking now, why sky blue during day turns red orange at sunset? heard something about scattering don't understand it. explain like I'm a high school student?
```
