# TokenWise

> AI-powered prompt optimization platform. Enhance, compress, route, secure, and verify LLM prompts — all in one pipeline.

---

## What It Does

TokenWise is a full-stack agentic system that sits between your prompts and your LLMs. Every prompt passes through a 5-stage pipeline before it reaches a model, and every response is verified before it reaches the user.

```
Input → Planner → Enhancer → Compressor → Router → LLM → Verifier → Output
```

---


## Key Metrics

| Metric | Value |
|---|---|
| Average token savings | ~40–60% |
| Routing latency (local) | < 250 ms |
| Verification accuracy | ~95% |
| Jailbreak pattern coverage | 25+ patterns |
| Supported attack types | Jailbreak · Prompt Injection · Data Exfiltration |
| Local model | Gemma 3 4B (Ollama) |
| Remote model | Gemini 2.5 Flash |
| Cost per 1M tokens (remote) | $0.002 |

---

## Pipeline Stages

### 1 — Planner
Runs on the local Gemma model. Analyses the prompt and decides which downstream tools to activate: `enhance`, `compress`, `smart_optimize`. Returns a JSON action plan with a reason.

### 2 — Enhancer
Fixes grammar, spelling, and clarity. Preserves the original meaning exactly. Powered by Gemini 2.5 Flash.

### 3 — Compressor
Strips filler words, politeness, and redundancy. Reduces token count aggressively without changing intent.

### 4 — Smart Optimizer
Full semantic rewrite using Gemini for maximum LLM performance. Used only when the planner decides it is needed.

### 5 — Router
Analyses prompt complexity and routes to:
- **Local** — Gemma 3 4B via Ollama for simple/medium prompts (zero cost, low latency)
- **Gemini** — Gemini 2.5 Flash for complex prompts requiring cloud intelligence

### 6 — Verifier
Evaluates the LLM response on 5 criteria: Correctness, Completeness, Clarity, Relevance, Grammar. Scores 0–10. If score < 8, automatically retries with Gemini.

### 7 — Risk Detector
Pattern-based jailbreak scanner that runs on every prompt. Detects 3 attack categories across 25+ patterns. Returns risk level (LOW / MEDIUM / HIGH) and matched patterns.

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Local LLM | Ollama + Gemma 3 4B |
| Remote LLM | Google Gemini 2.5 Flash |
| Tokenizer | tiktoken |
| Server | Uvicorn |
| Language | Python 3.11+ |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Toasts | React Hot Toast |
| Diff View | diff |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/agent` | Full 5-stage optimization pipeline |
| `POST` | `/optimize` | Token compression only |
| `POST` | `/smart-optimize` | Gemini-powered semantic rewrite + metrics |
| `POST` | `/enhance` | Grammar and clarity improvement |
| `POST` | `/compress` | Filler word removal |
| `POST` | `/tokenize` | Count tokens in a prompt |
| `POST` | `/detect-risk` | Jailbreak and injection detection |
| `POST` | `/route` | Route analysis without full pipeline |
| `GET` | `/dashboard` | Live analytics and request history |

All `POST` endpoints accept `{ "prompt": "string" }`.

---

## Folder Structure

```
tokenwise/
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app + CORS
│   │   │
│   │   ├── api/
│   │   │   └── routes.py            # All API route definitions
│   │   │
│   │   ├── core/
│   │   │   └── gemini_client.py     # Gemini SDK client
│   │   │
│   │   ├── engine/
│   │   │   ├── agent.py             # Main pipeline orchestrator
│   │   │   ├── planner.py           # Action planner (local LLM)
│   │   │   ├── enhancer.py          # Grammar + clarity
│   │   │   ├── compressor.py        # Token compression
│   │   │   ├── optimizer.py         # Standard optimizer
│   │   │   ├── smart_optimizer.py   # Gemini semantic optimizer
│   │   │   ├── router.py            # Local vs remote routing
│   │   │   ├── verifier.py          # Response quality scorer
│   │   │   ├── jailbreak_detector.py# Risk detection
│   │   │   ├── complexity_analyser.py# Prompt complexity scoring
│   │   │   ├── confidence.py        # Confidence estimation
│   │   │   ├── scorer.py            # Response scoring
│   │   │   ├── tokenizer.py         # tiktoken wrapper
│   │   │   ├── local_llm.py         # Ollama Gemma client
│   │   │   ├── fireworks_llm.py     # Gemini remote client
│   │   │   └── rules.py             # Rule-based filters
│   │   │
│   │   ├── models/
│   │   │   └── schemas.py           # Pydantic request/response models
│   │   │
│   │   └── analytics/
│   │       └── metrics.py           # In-memory request logging + dashboard
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── index.css                # Tailwind entry + global styles
│   │   ├── main.tsx                 # React entry point
│   │   ├── App.tsx                  # Router + AppProvider
│   │   │
│   │   ├── components/
│   │   │   ├── Common/
│   │   │   │   ├── Button.tsx       # Variant button (primary/secondary/ghost)
│   │   │   │   ├── Card.tsx         # Glass card wrapper
│   │   │   │   ├── Loader.tsx       # Spinner (sm/md/lg)
│   │   │   │   ├── StatCard.tsx     # Metric stat card
│   │   │   │   ├── GlassCard.tsx    # Backdrop blur card
│   │   │   │   ├── Loading.tsx      # Full-screen loader
│   │   │   │   └── ErrorToast.tsx   # Inline error toast
│   │   │   │
│   │   │   ├── Navbar/
│   │   │   │   └── Navbar.tsx       # Sticky top nav with active links
│   │   │   │
│   │   │   ├── Hero/
│   │   │   │   └── Hero.tsx         # Landing hero with scroll CTA
│   │   │   │
│   │   │   ├── Layout/
│   │   │   │   ├── DashboardLayout.tsx  # Navbar + main wrapper
│   │   │   │   ├── AppLayout.tsx        # Sidebar layout (alt)
│   │   │   │   ├── Sidebar.tsx          # Nav sidebar
│   │   │   │   └── AnimatedButton.tsx   # styled-components button
│   │   │   │
│   │   │   ├── Prompt/
│   │   │   │   ├── PromptEditor.tsx  # Textarea (Ctrl+Enter to run)
│   │   │   │   ├── PromptToolbar.tsx # Run / Stop / Enhance / Copy
│   │   │   │   └── PromptStats.tsx   # Live char/token/savings counts
│   │   │   │
│   │   │   ├── Pipeline/
│   │   │   │   └── Pipeline.tsx      # Animated 5-stage horizontal pipeline
│   │   │   │
│   │   │   ├── Execution/
│   │   │   │   └── LiveExecution.tsx # Animated vertical step tracker
│   │   │   │
│   │   │   ├── Response/
│   │   │   │   └── ResponseCard.tsx  # Final response with meta grid
│   │   │   │
│   │   │   ├── Dashboard/
│   │   │   │   ├── Workspace.tsx         # Main container (run logic)
│   │   │   │   ├── AnalyticsCard.tsx     # Post-run metric cards
│   │   │   │   ├── ExecutionTimeline.tsx # Agent step timeline
│   │   │   │   ├── Token_analytics.tsx   # Token bar + route pie chart
│   │   │   │   ├── TokenDiff.tsx         # Word-level diff viewer
│   │   │   │   ├── ChatWindow.tsx        # Chat-style response view
│   │   │   │   ├── BudgetPlanner.tsx     # Context window budget
│   │   │   │   ├── CostCalculator.tsx    # Per-model cost breakdown
│   │   │   │   ├── OptimizationHistory.tsx # History list from context
│   │   │   │   └── StatsCards.tsx        # Summary stat grid
│   │   │   │
│   │   │   ├── Optimizer/
│   │   │   │   ├── OptimizationResult.tsx # Score, diff, before/after
│   │   │   │   └── DiffViewer.tsx         # Word diff component
│   │   │   │
│   │   │   ├── Simulator/
│   │   │   │   └── ChatSimulator.tsx  # Conversation capacity simulator
│   │   │   │
│   │   │   ├── TokenVisualiser/
│   │   │   │   └── TokenHeatmap.tsx   # Word-level token heat map
│   │   │   │
│   │   │   └── Auth/
│   │   │       └── LoginForm.tsx      # Login form UI
│   │   │
│   │   ├── context/
│   │   │   ├── AppProvider.tsx        # Composes all providers
│   │   │   ├── AgentContext.tsx       # Global agent state + run control
│   │   │   ├── HistoryContext.tsx     # localStorage-backed history
│   │   │   └── ThemeContext.tsx       # Dark/light theme toggle
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAgents.ts           # Agent API hook with abort support
│   │   │   └── useTokenizer.ts        # Debounced token counter hook
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Main page (Hero + Workspace)
│   │   │   ├── OptimizerPage.tsx      # Standalone optimizer tool
│   │   │   ├── LoginPage.tsx          # Auth page
│   │   │   └── Settings.tsx           # Backend config + API reference
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                 # Typed axios functions for all endpoints
│   │   │
│   │   ├── types/
│   │   │   └── api.ts                 # TypeScript interfaces for all API shapes
│   │   │
│   │   └── utils/
│   │       ├── api.ts                 # Re-export of services/api
│   │       ├── optimizerApi.ts        # Optimize + enhance helpers
│   │       └── tokenizerApi.ts        # Token count helper
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── extension/                         # Chrome extension (popup UI)
│   ├── manifest.json
│   ├── popup.html / popup.js / popup.css
│   └── content.js
│
├── .env                               # GEMINI_API_KEY
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- [Ollama](https://ollama.ai) installed and running locally
- Gemini API key from [Google AI Studio](https://aistudio.google.com)

### 1 — Clone

```bash
git clone https://github.com/your-username/tokenwise.git
cd tokenwise
```

### 2 — Pull the local model

```bash
ollama pull gemma3:4b
```

### 3 — Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_key_here
```

Start the server:

```bash
uvicorn app.main:app --reload
# Running on http://127.0.0.1:8000
```

### 4 — Frontend setup

```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## How the Agent Works

```
User Prompt
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  Planner  (Gemma 3 local)                               │
│  Decides: enhance? compress? smart_optimize?            │
└────────────────────────────┬────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
      Enhancer           Compressor       Smart Optimizer
  (grammar/clarity)   (remove filler)   (Gemini rewrite)
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │    Router    │
                     │ complexity   │
                     │  analysis   │
                     └──────┬───────┘
                           / \
                          /   \
                    Local       Gemini
                  (Gemma 3)  (2.5 Flash)
                          \   /
                           \ /
                             │
                             ▼
                       ┌──────────┐
                       │ Verifier │  score 0–10
                       └──────┬───┘
                              │
                    score ≥ 8 │ score < 8
                              │      │
                              │      ▼
                              │  Gemini retry
                              │      │
                              └──────┘
                                     │
                                     ▼
                               Final Response
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

---

## Scripts

| Command | Description |
|---|---|
| `uvicorn app.main:app --reload` | Start backend dev server |
| `npm run dev` | Start frontend dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |

---

## License

MIT
