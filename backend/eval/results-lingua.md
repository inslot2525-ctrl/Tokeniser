## Summary

- Method: Rules + LLMLingua-2
- Prompts: 20
- Total tokens saved: 455 of 1065 (42.7%)
- Mean / median reduction per prompt: 34.4% / 45.6%
- API tokens spent on compression: 0
- Median latency: 231.5 ms

## Per prompt

| id | original | compressed | saved % | ms |
|---|---:|---:|---:|---:|
| verbose-1 | 65 | 25 | 61.54 | 2 |
| verbose-2 | 66 | 27 | 59.09 | 266 |
| verbose-3 | 64 | 22 | 65.62 | 286 |
| verbose-4 | 67 | 36 | 46.27 | 271 |
| verbose-5 | 86 | 48 | 44.19 | 250 |
| verbose-6 | 71 | 29 | 59.15 | 230 |
| verbose-7 | 66 | 29 | 56.06 | 244 |
| verbose-8 | 64 | 33 | 48.44 | 233 |
| verbose-9 | 94 | 88 | 6.38 | 2 |
| verbose-10 | 73 | 39 | 46.58 | 243 |
| concise-1 | 8 | 8 | 0.0 | 0 |
| concise-2 | 10 | 10 | 0.0 | 0 |
| concise-3 | 16 | 16 | 0.0 | 0 |
| concise-4 | 11 | 11 | 0.0 | 0 |
| concise-5 | 12 | 12 | 0.0 | 0 |
| constraint-1 | 54 | 48 | 11.11 | 1 |
| constraint-2 | 52 | 25 | 51.92 | 235 |
| constraint-3 | 60 | 33 | 45.0 | 228 |
| hard-1 | 66 | 39 | 40.91 | 270 |
| hard-2 | 60 | 32 | 46.67 | 251 |

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
sky blue during day turns red orange at sunset. heard about scattering don't understand. Explain'high school student.
```
**verbose-4**

```
working on project for company manager asked me to write email to team office closed next Friday maintenance work on building. Write short professional email. mention people can work from home that day.
```
