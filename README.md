# Tokeniser

> A prompt optimization and model-routing pipeline. It trims prompts, sends easy requests to a free local model and hard ones to Gemini, checks local answers before returning them, and reports what the pipeline itself cost.

[![CI](https://github.com/inslot2525-ctrl/Tokeniser/actions/workflows/ci.yml/badge.svg)](https://github.com/inslot2525-ctrl/Tokeniser/actions/workflows/ci.yml)

---

## What it does

```
prompt ─► risk check ─► planner ─► rewrite (optional) ─► classify ─► route
                                                                       │
                       ┌───────────────────────────────────────────────┤
                       ▼                                               ▼
                 Local (Ollama)                                  Gemini 2.5 Flash
                       │
                       ▼
            Gemini judge scores it ── score < 8 ──► re-answer on Gemini
```

| Stage | How it works | LLM calls |
|---|---|---|
| Risk check | Regex patterns over normalised text (case, spacing, punctuation, leetspeak). HIGH risk is blocked before any model call. | 0 |
| Planner | Skips the rewrite for prompts under 60 tokens, because the rewrite call would cost more than it saves. | 0 |
| Rewrite | One call that fixes grammar and removes filler. If the result isn't shorter, the original is kept. Runs on the local model when available. | 0–1 |
| Classifier | Rule-based: length, task type (code/math/…), reasoning keywords, number of asks. Returns the signals behind each decision. | 0 |
| Router | Easy/Medium → local model, Hard → Gemini. `MODEL_PROVIDER` can pin either one. If Ollama is down it falls back to Gemini and reports the route that *actually* answered. | 1 |
| Verifier | Only for local answers: a Gemini judge scores 0–10, and anything under the threshold is re-answered on Gemini. | 0–2 |

A full `/agent` request makes **1 to 4** LLM calls (the first version made up to 8).

### Honest accounting

Every `/agent` response includes token accounting for the pipeline itself (illustrative values):

```json
"tokens": {
  "original": 96, "optimized": 41, "saved": 55,
  "pipeline_overhead": 228,
  "net_saved": -173
}
```

Rewriting a prompt costs tokens: the instructions, the prompt going in, and the rewrite coming out. **For a prompt you send once, optimization almost always costs more than it saves.** It pays off when:

- the rewrite runs on the free local model and the answer comes from the paid remote model, or
- the optimized prompt is reused, e.g. a system prompt or template sent thousands of times. The eval reports the break-even reuse count.

The dashboard reports both gross and net savings for the same reason.

---

## Evaluation

`backend/eval/run_eval.py` runs 20 prompts (verbose, concise, constraint-heavy and hard) through the optimizer. It measures:

- prompt-token reduction (mean and median),
- rewrite overhead and net tokens,
- the break-even reuse count,
- with `--quality`: a blind pairwise judge comparing answers to the original vs. the rewritten prompt, to catch rewrites that drop constraints.

```bash
cd backend
python -m eval.run_eval --quality --out eval/results.md
```

> **Results:** run the command above with your API key and paste the summary here. Don't quote numbers that weren't measured.

---

## API

All `POST` endpoints take `{ "prompt": "string" }`. LLM-backed endpoints are rate limited per IP and accept an `X-API-Key` header when `API_KEY` is set.

| Method | Path | Description | LLM |
|---|---|---|---|
| `POST` | `/agent` | Full pipeline: risk → plan → rewrite → route → verify | ✓ |
| `POST` | `/smart-optimize` | Grammar fix + compression, with token metrics | ✓ |
| `POST` | `/optimize` | Aggressive compression, with token metrics | ✓ |
| `POST` | `/compress` | Same as `/optimize`, also returns `compressed` | ✓ |
| `POST` | `/enhance` | Grammar and clarity only, also returns `enhanced` | ✓ |
| `POST` | `/route` | Classify, route and answer | ✓ |
| `POST` | `/tokenize` | Token count (tiktoken `o200k_base`) | |
| `POST` | `/detect-risk` | Jailbreak / injection / exfiltration check | |
| `GET` | `/dashboard` | Totals, gross and net savings, route mix, recent requests | |
| `GET` | `/health` | Liveness check | |

Token counts use tiktoken's `o200k_base` (the GPT-4o encoding). Gemini and Gemma use different tokenizers, so the counts are a consistent approximation for comparing prompts, not exact billing numbers. Cost estimates use the token usage the model API actually reports.

---

## Project layout

```
backend/
  app/
    main.py              FastAPI app, CORS, error handling
    config.py            All settings, read from env
    api/routes.py        Endpoints
    api/security.py      API key + per-IP rate limiter
    engine/
      agent.py           Pipeline orchestration + token accounting
      llm.py             Gemini / Ollama clients, fallback, usage tracking
      optimizer.py       Single-call rewrite (enhance | compress | optimize)
      planner.py         Decides whether a rewrite is worth it
      complexity.py      Rule-based difficulty classifier
      router.py          Backend choice + cost
      verifier.py        LLM-as-judge for local answers
      jailbreak_detector.py
      tokenizer.py
    analytics/metrics.py SQLite request log + dashboard
    models/schemas.py    Request validation (length cap, non-blank)
  tests/                 pytest suite; LLMs are faked, no network needed
  eval/                  Prompt set + evaluation script
  Dockerfile
frontend/                React 19 + TypeScript + Vite + Tailwind
extension/               Chrome extension popup (MV3)
```

---

## Running locally

Prerequisites: Python 3.11+, Node 20+, a [Gemini API key](https://aistudio.google.com), and optionally [Ollama](https://ollama.com) for the local route.

```bash
# Local model (optional; without it everything routes to Gemini)
ollama pull gemma3:4b

# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows  (source .venv/bin/activate on macOS/Linux)
pip install -r requirements-dev.txt
cp .env.example .env              # then set GEMINI_API_KEY
uvicorn app.main:app --reload     # http://127.0.0.1:8000
pytest                            # run tests

# Frontend
cd frontend
cp .env.example .env
npm ci
npm run dev                       # http://localhost:5173
```

Or run the backend with Docker:

```bash
docker build -t tokeniser-backend backend
docker run -p 8000:8000 --env-file backend/.env tokeniser-backend
```

To use the Chrome extension, open `chrome://extensions`, enable Developer mode, click **Load unpacked** and select `extension/`. Set `API_BASE` at the top of `popup.js` if your backend isn't on `127.0.0.1:8000`.

---

## Configuration

See [`backend/.env.example`](backend/.env.example).

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | — | Required for the remote route, the verifier and the fallback |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Remote model |
| `MODEL_PROVIDER` | `auto` | `auto` (router decides), `gemini`, or `ollama` |
| `OLLAMA_URL` / `OLLAMA_MODEL` | `localhost:11434` / `gemma3:4b` | Local model |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `API_KEY` | empty (off) | Require `X-API-Key` on LLM endpoints |
| `RATE_LIMIT_PER_MINUTE` | `20` | Per-IP limit on LLM endpoints (in-process) |
| `MAX_PROMPT_CHARS` | `8000` | Reject longer prompts |
| `LLM_TIMEOUT_SECONDS` | `60` | Per-call timeout |
| `VERIFY_THRESHOLD` | `8` | Local answers scoring below this are escalated |
| `REMOTE_INPUT_PRICE_PER_M` / `REMOTE_OUTPUT_PRICE_PER_M` | `0.30` / `2.50` | USD per 1M tokens, for cost estimates |
| `METRICS_DB_PATH` | `metrics.db` | SQLite file for the dashboard |

---

## Known limitations

- **The risk detector is a pattern filter, not a classifier.** It stops low-effort attacks for free, but paraphrased attacks will get through. A production system would add a trained classifier or a moderation API.
- **The classifier is heuristic.** It's explainable and free, but it will misroute some prompts. The verifier-escalation loop is the safety net. A natural next step is training a small classifier on logged routes and verifier scores.
- **The rate limiter is per-process.** Multiple workers or instances would need a shared store such as Redis.
- **The LLM judge has known biases** (towards longer answers, and towards its own model family). Scores are a signal, not ground truth.

---

## License

MIT
