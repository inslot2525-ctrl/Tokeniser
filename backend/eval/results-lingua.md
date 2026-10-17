## Summary

- Method: Rules + LLMLingua-2
- Prompts: 20
- Mean prompt-token reduction: 36.1%
- Median prompt-token reduction: 46.3%
- Total prompt tokens saved: 473 of 1065
- Total rewrite overhead: 0 tokens
- Net tokens for a single use: 473
- Break-even: first use (compression spends no API tokens)
- Median latency: 275.5 ms

## Per prompt

| id | original | optimized | saved % | overhead | net | ms |
|---|---:|---:|---:|---:|---:|---:|
| verbose-1 | 65 | 25 | 61.54 | 0 | 40 | 2 |
| verbose-2 | 66 | 27 | 59.09 | 0 | 39 | 330 |
| verbose-3 | 64 | 22 | 65.62 | 0 | 42 | 301 |
| verbose-4 | 67 | 36 | 46.27 | 0 | 31 | 260 |
| verbose-5 | 86 | 48 | 44.19 | 0 | 38 | 275 |
| verbose-6 | 71 | 29 | 59.15 | 0 | 42 | 308 |
| verbose-7 | 66 | 29 | 56.06 | 0 | 37 | 280 |
| verbose-8 | 64 | 33 | 48.44 | 0 | 31 | 250 |
| verbose-9 | 94 | 88 | 6.38 | 0 | 6 | 1 |
| verbose-10 | 73 | 39 | 46.58 | 0 | 34 | 281 |
| concise-1 | 8 | 8 | 0.0 | 0 | 0 | 0 |
| concise-2 | 10 | 10 | 0.0 | 0 | 0 | 0 |
| concise-3 | 16 | 16 | 0.0 | 0 | 0 | 0 |
| concise-4 | 11 | 11 | 0.0 | 0 | 0 | 0 |
| concise-5 | 12 | 12 | 0.0 | 0 | 0 | 0 |
| constraint-1 | 54 | 29 | 46.3 | 0 | 25 | 308 |
| constraint-2 | 52 | 26 | 50.0 | 0 | 26 | 276 |
| constraint-3 | 60 | 33 | 45.0 | 0 | 27 | 280 |
| hard-1 | 66 | 39 | 40.91 | 0 | 27 | 306 |
| hard-2 | 60 | 32 | 46.67 | 0 | 28 | 303 |

## Sample outputs

**verbose-1**

```
Explain to me, in simple terms if possible, what the difference is between a process and a thread in an operating system.
```
**verbose-2**

```
Write me Python function takes list of numbers returns new list only even numbers. appreciate if code clean well documented if handles empty list properly.
```
**verbose-3**

```
Why sky blue during day turns red orange at sunset. heard about scattering don't understand. Explain high school student.
```
