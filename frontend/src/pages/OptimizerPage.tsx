import { useState } from "react";
import toast from "react-hot-toast";

import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Loader from "../components/Common/Loader";
import TokenHeatmap from "../components/TokenVisualiser/TokenHeatmap";
import OptimizationResult from "../components/Optimizer/OptimizationResult";
import BudgetPlanner from "../components/Dashboard/BudgetPlanner";
import CostCalculator from "../components/Dashboard/CostCalculator";
import ChatSimulator from "../components/Simulator/ChatSimulator";

import { optimizePrompt, enhancePrompt } from "../services/api";
import type { OptimizeResponse } from "../types/api";
import { useHistory } from "../context/HistoryContext";

const MODELS = ["gpt-4o", "gpt-3.5-turbo", "claude-3-opus", "gemini-pro"] as const;
type ModelName = (typeof MODELS)[number];

const CONTEXT_WINDOWS: Record<ModelName, number> = {
  "gpt-4o": 128000,
  "gpt-3.5-turbo": 16385,
  "claude-3-opus": 200000,
  "gemini-pro": 32768,
};

export default function OptimizerPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelName>("gpt-4o");
  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { addEntry } = useHistory();

  // live token estimate (~4 chars/token)
  const liveTokens = Math.ceil(prompt.length / 4);

  async function handleOptimize() {
    if (!prompt.trim()) { toast.error("Enter a prompt first"); return; }
    setLoading(true);
    try {
      const res = await optimizePrompt(prompt);
      setResult(res);
      addEntry({
        originalPrompt: prompt,
        optimizedPrompt: res.optimized,
        savedTokens: res.saved_tokens,
        savingsPercent: res.savings_percent,
        model: selectedModel,
        route: "optimize",
        prompt,
        optimized: res.optimized,
      });
      toast.success(`Saved ${res.saved_tokens} tokens (${res.savings_percent}%)`);
    } catch {
      toast.error("Optimization failed — is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnhance() {
    if (!prompt.trim()) { toast.error("Enter a prompt first"); return; }
    setLoading(true);
    try {
      const res = await enhancePrompt(prompt);
      setPrompt(res.enhanced);
      toast.success("Prompt enhanced");
    } catch {
      toast.error("Enhance failed — is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Editor card */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Prompt Optimizer</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Compress and enhance prompts via the backend pipeline.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400">
            <span className="font-bold text-white">{liveTokens}</span> est. tokens
          </div>
        </div>

        {/* Model selector */}
        <div className="mt-5">
          <label className="mb-1 block text-xs font-medium text-gray-500">Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ModelName)}
            className="rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-orange-400/50"
          >
            {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Textarea */}
        <div className="mt-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste your prompt here…"
            rows={8}
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm leading-7 text-white placeholder-gray-600 outline-none focus:border-orange-400/40"
          />
        </div>

        <TokenHeatmap text={prompt} />

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3">
          <Button onClick={handleOptimize} disabled={loading || !prompt.trim()}>
            {loading ? <Loader size="sm" className="inline" /> : null}
            {loading ? " Optimizing…" : "Optimize Prompt"}
          </Button>
          <Button variant="secondary" onClick={handleEnhance} disabled={loading || !prompt.trim()}>
            Enhance Prompt
          </Button>
          <Button variant="ghost" onClick={() => { setPrompt(""); setResult(null); }} className="ml-auto text-gray-500">
            Clear
          </Button>
        </div>
      </Card>

      {/* Results */}
      {result && (
        <>
          <OptimizationResult result={result} />

          <div className="grid gap-6 lg:grid-cols-2">
            <BudgetPlanner
              originalTokens={result.original_tokens}
              optimizedTokens={result.optimized_tokens}
              budget={CONTEXT_WINDOWS[selectedModel]}
            />
            <CostCalculator
              modelName={selectedModel}
              originalTokens={result.original_tokens}
              optimizedTokens={result.optimized_tokens}
            />
          </div>

          <ChatSimulator
            originalTokens={result.original_tokens}
            optimizedTokens={result.optimized_tokens}
            contextWindow={CONTEXT_WINDOWS[selectedModel]}
          />
        </>
      )}
    </div>
  );
}
