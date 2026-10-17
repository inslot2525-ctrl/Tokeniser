# TokenWise: interview guide

A guide to explaining this project out loud. Read it top to bottom once, then use the
question list to practise.

---

## 1. The 30-second pitch

> TokenWise sits between a user and an LLM. It **compresses prompts for free**, **routes** easy
> prompts to a local model and hard ones to Gemini, and **checks the answer** before returning it.
>
> It works with no API key: free mode runs on rules and local models. Users can add their own
> Gemini key for AI mode, so the app owner never pays for AI calls.
>
> The interesting part is that I **measured my own system**. The first version compressed prompts
> by asking an LLM to rewrite them, and I found that it spent *more* tokens than it saved. So I
> replaced it with local compression: rules plus a small on-device model, LLMLingua-2. On my
> 20-prompt eval that saves **44% of tokens at zero API cost**.

## 2. The story (use this when asked "tell me about a project")

1. **Problem.** LLM APIs charge per token, and real prompts are full of filler: "Hi! I hope
   you're doing well. Could you please…".
2. **First attempt.** Ask an LLM to rewrite the prompt shorter.
3. **Measurement.** I made every response report the tokens the *pipeline itself* spent. The
   rewrite call costs its instructions, the prompt going in and the rewrite coming out. For a
   prompt sent once, that was more than it saved: net savings were **negative**.
4. **Redesign.** Compress locally, so the cost is zero. A rule-based compressor removes listed
   filler, then LLMLingua-2 (a small model that runs on the CPU) drops low-information words.
5. **Checking the output.** Reading the compressed prompts showed real problems: identifiers
   split (`customer _ id`), code mangled (`i <= arr.length` became `i < = arr. length`), and
   short prompts losing their verb. I added a fix and a test for each.
6. **Result.** Rules alone save 15.1%; rules + LLMLingua-2 save 44.4%. Both spend 0 API tokens.

The lesson to say out loud: *"Measure the whole system, including your own overhead, not just
the part that looks good."*

## 3. Architecture in one picture

```
Browser (React)  --POST /agent {prompt, mode}-->  FastAPI backend
   Settings stores the user's Gemini key            |
   sent as X-Gemini-Key in AI mode only             v
                                     1. Risk check     (regex, local)
                                     2. Compress       (rules -> LLMLingua-2, local)
                                     3. Route          (rule-based classifier, local)
                                     4. Answer         (Ollama local, or Gemini in AI mode)
                                     5. Check          (rule checks; AI mode adds Gemini judge)
                                                    |
                                     SQLite: request metrics for /dashboard
```

The whole pipeline is one function, `run_agent()` in `backend/app/engine/agent.py`, and its five
steps are numbered in the code. The backend's app code is about 1,200 lines.

## 4. Each component in two or three sentences

| Component | File | What it does | Why this way |
|---|---|---|---|
| **Risk check** | `jailbreak_detector.py` | 13 regex patterns (jailbreak, injection, data exfiltration) run on normalised text: lower-cased, leetspeak undone (`1gn0re` → `ignore`), punctuation removed. Two or more matches, or any exfiltration match, means HIGH, and the prompt is blocked before any model call. | Free and instant. A first-line filter, not a real classifier. |
| **Rule compressor** | `rule_compressor.py` | 21 regex patterns for filler (greetings, "could you please", sign-offs, hedges). Reports every phrase it removed, and turns "Could you explain X?" into "Explain X.". | It only deletes what's on the list, so it **can't** drop "not" or a number. Runs in under 1 ms, so it works on any host. |
| **LLMLingua-2** | `compressor.py` | A small BERT model (~700 MB) scores each token and keeps the most informative 60%. Constraint words ("not", "exactly", "must") and numbers are force-kept; code is never touched; prompts under 40 tokens are skipped. | Bigger savings than rules, still 0 API tokens. Optional, because it needs ~1.5 GB of RAM. |
| **Classifier / router** | `complexity.py`, `router.py` | Scores the prompt on length, task type (code, math…), "deep reasoning" keywords and number of questions. Easy/Medium → local model, Hard → Gemini. | Explainable and free. The first version paid Gemini to decide whether to use Gemini. |
| **LLM clients** | `llm.py` | Talks to Ollama and Gemini, and records the tokens of every call. Each request runs inside a `session()` that says whether Gemini may be used and with which key. | Per-request key handling without passing the key through every function. |
| **Answer checks** | `answer_checks.py` | Rules that catch visibly bad answers: empty, refusal, cut-off code, missing code, "exactly four" answered with five items, wrong sentence count, a word the prompt said not to mention. Always checked against the **original** prompt. | Free. A failed check sends a local answer straight to Gemini without paying for a judge. |
| **Judge** | `verifier.py` | AI mode only: Gemini scores a local answer 0–10, and below 8 the prompt is re-answered by Gemini. | Catches *wrong* answers, which rules can't. Only runs when the cheap checks pass. |
| **Security** | `api/security.py`, `models/schemas.py` | Per-IP rate limit (20/min), 8,000-character prompt cap, optional server API key, 60 s timeouts on model calls. | Basic abuse protection for a public demo. |

## 5. Numbers to remember

- **44.4%** of tokens saved with rules + LLMLingua-2 (473 of 1,065 on 20 prompts); **15.1%** with rules alone.
- **0** API tokens spent on compression.
- **0 to 3** LLM calls per request: 0 in free mode without Ollama, up to 3 in AI mode (answer, judge, retry).
- **61** backend tests (no network needed), plus a 13-check browser test.
- JavaScript bundle reduced from **834 KB to 342 KB** by removing unused features.

## 6. Likely questions, with answers

**Why not just ask an LLM to shorten the prompt?**
Because the rewrite call costs tokens: instructions, the prompt in, the rewrite out. I measured
it and, for a prompt sent once, it spent more than it saved. Local compression costs nothing,
so every saved token is a real saving.

**Why run rules before LLMLingua-2?**
Rules remove pleasantries cleanly and keep the prompt readable, while in my eval outputs the
model often kept things like "Thank you!". After the rules, a chatty prompt is
often under 40 tokens, so LLMLingua-2 is skipped. That's deliberate: on short prompts it drops
the instruction itself.

**How do you know compression doesn't make the answers worse?**
Three safeguards: constraint words and numbers are force-kept, code is never compressed, and
the answer checks always use the *original* prompt, so a constraint lost to compression would
still be caught in the answer. For measurement, the eval has a `--quality` mode: it answers both
versions with Gemini and has a blind judge compare them. *(Say the result here once you've run
it. Until then, be honest: "token savings are measured; quality is the next thing I'm
measuring".)*

**How do you keep the user's API key safe?**
It's stored only in the user's browser, in session storage by default so it's cleared when the
tab closes. It's sent only to my backend, in a header, only in AI mode. The backend uses it for
that one request and never stores or logs it; I tested this by sending a fake key and checking
the logs. On a real deployment it must go over HTTPS.

**Why did you use a ContextVar for the key?**
Each request has its own key and mode. FastAPI runs normal (non-async) endpoints in a thread
pool, so a global variable would leak between users. A `ContextVar` is per-request, and it
saves passing the key as an argument through every function down to the Gemini client.

**Tell me about a bug you found.**
User keys could never have worked. I created a Gemini client for each request inline, like
`make_client(key).models.generate_content(...)`. The client object was garbage-collected before
the request ran, and its destructor closed the HTTP connection. My tests didn't catch it because
they fake Gemini; I found it by testing the real server with a deliberately wrong key. The fix
was to keep a reference to the client for the whole call, and I added a regression test.

**How does routing work, and why not machine learning?**
A points system: long prompt +1 or +2, "design / trade-offs / step by step" +2, coding or math
+1, three or more questions +1. Three or more points means Hard, which goes to Gemini. It's
transparent, free and instant. The next step would be training a small classifier on logged
prompts and whether their local answers passed the checks.

**Why have rule checks AND a judge?**
It's a cascade: cheap check first, expensive check only when needed. Rules catch visibly broken
answers for free. If a local answer fails them, it goes straight to Gemini with no judge call.
The judge only runs on answers that look fine, to catch ones that are subtly wrong.

**What are the judge's weaknesses?**
LLM judges favour longer answers and answers from their own model family, and the score varies
between runs. I treat it as a signal, not ground truth, and always show the rule-check result
next to it.

**How do you test code that calls LLMs?**
A fake LLM in `tests/conftest.py` replaces the network calls and records what was sent, so 61
tests run offline in about 10 seconds. That lets me test things like "free mode never calls
Gemini" or "a failed check escalates without a judge call". A separate browser test drives the
real UI against a real backend. The eval script is kept apart from the tests because it
measures quality, not correctness.

**Is it scalable?**
The cost model is: every user pays for their own AI calls, and the rule-based parts are cheap
CPU work. The code would hit limits in this order:
1. **Model calls block worker threads** (about 40 per process), so I'd make them `async`.
2. **The rate limiter and metrics are per-process**, so I'd move them to Redis and Postgres.
   Then the API can run as many copies as needed behind a load balancer.
3. **LLMLingua-2 needs ~1 GB of RAM and handles ~3 prompts/second per copy**, so I'd run it as a
   separate service.

**How strong is the jailbreak detection?**
It's pattern matching. It stops copy-pasted attacks and simple tricks like odd spacing or
leetspeak, but a paraphrased attack will get through. Production would add a trained classifier
(e.g. Llama Guard) or a moderation API. I'd rather say that than oversell it.

**What would you do differently?**
Measure earlier. I built the LLM rewrite before measuring it, and only the measurement showed it
was losing tokens. I'd also have kept the scope smaller from the start; I later removed several
features (fake login, a cost calculator, duplicate endpoints) that weren't pulling their weight.

**What was the hardest part?**
Making compression *safe*, not just short. The numbers looked good from the start, but reading
the actual outputs showed split identifiers, mangled code and dropped verbs. Each one needed a
targeted fix and a test.

## 7. Limitations to state before they're pointed out

- Answer quality after compression isn't measured yet (the eval exists; run it with a key).
- Rule checks catch broken answers, not wrong ones; that's what the judge is for.
- Rule compression only knows English filler from its list, which caps its savings around 15%.
- The jailbreak check is pattern-based and can be paraphrased around.
- Token counts use the GPT-4o tokenizer as a consistent approximation; Gemini counts differently.

## 8. Words you might need to define

- **Token:** a chunk of text (roughly ¾ of a word) that LLM APIs count and charge for.
- **Extractive compression:** shortening by deleting words, without rewriting (LLMLingua-2).
- **LLM-as-judge:** using an LLM to score another model's answer.
- **Cascade:** try the cheap option first, and only escalate to the expensive one when needed.
- **BYOK (bring your own key):** users supply their own API key, so they pay for their own usage.
- **ContextVar:** Python's per-request (per-task or per-thread) variable, used here to scope a user's key.
