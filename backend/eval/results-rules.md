## Summary

- Method: Rules
- Prompts: 20
- Mean prompt-token reduction: 12.2%
- Median prompt-token reduction: 7.1%
- Total prompt tokens saved: 161 of 1065
- Total rewrite overhead: 0 tokens
- Net tokens for a single use: 161
- Break-even: first use (compression spends no API tokens)
- Median latency: 0.0 ms

## Per prompt

| id | original | optimized | saved % | overhead | net | ms |
|---|---:|---:|---:|---:|---:|---:|
| verbose-1 | 65 | 25 | 61.54 | 0 | 40 | 6 |
| verbose-2 | 66 | 50 | 24.24 | 0 | 16 | 0 |
| verbose-3 | 64 | 41 | 35.94 | 0 | 23 | 0 |
| verbose-4 | 67 | 62 | 7.46 | 0 | 5 | 0 |
| verbose-5 | 86 | 79 | 8.14 | 0 | 7 | 0 |
| verbose-6 | 71 | 53 | 25.35 | 0 | 18 | 0 |
| verbose-7 | 66 | 50 | 24.24 | 0 | 16 | 0 |
| verbose-8 | 64 | 57 | 10.94 | 0 | 7 | 0 |
| verbose-9 | 94 | 88 | 6.38 | 0 | 6 | 0 |
| verbose-10 | 73 | 70 | 4.11 | 0 | 3 | 0 |
| concise-1 | 8 | 8 | 0.0 | 0 | 0 | 0 |
| concise-2 | 10 | 10 | 0.0 | 0 | 0 | 0 |
| concise-3 | 16 | 16 | 0.0 | 0 | 0 | 0 |
| concise-4 | 11 | 11 | 0.0 | 0 | 0 | 0 |
| concise-5 | 12 | 12 | 0.0 | 0 | 0 | 0 |
| constraint-1 | 54 | 48 | 11.11 | 0 | 6 | 0 |
| constraint-2 | 52 | 45 | 13.46 | 0 | 7 | 0 |
| constraint-3 | 60 | 56 | 6.67 | 0 | 4 | 0 |
| hard-1 | 66 | 64 | 3.03 | 0 | 2 | 0 |
| hard-2 | 60 | 59 | 1.67 | 0 | 1 | 0 |

## Sample outputs

**verbose-1**

```
Explain to me, in simple terms if possible, what the difference is between a process and a thread in an operating system.
```
**verbose-2**

```
Write me a Python function that takes a list of numbers and returns a new list containing only the even numbers. I would really appreciate it if the code is clean and well documented and also if you could make sure that it handles an empty list properly.
```
**verbose-3**

```
Why is the sky blue during the day but it turns red and orange at sunset. I have heard something about scattering but I don't really understand it. Explain it to me like I'm a high school student.
```
