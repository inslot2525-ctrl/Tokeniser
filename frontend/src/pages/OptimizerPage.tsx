import { useState } from "react";
import toast from "react-hot-toast";

import Card from "../components/Common/Card";
import Button from "../components/Common/Button";
import Loader from "../components/Common/Loader";
import OptimizationResult from "../components/Optimizer/OptimizationResult";

import { apiErrorMessage, compressPrompt, enhancePrompt } from "../services/api";
import type { CompressResponse } from "../types/api";
import { useHistory } from "../context/HistoryContext";
import { useSettings } from "../context/SettingsContext";

export default function OptimizerPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<CompressResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { addEntry } = useHistory();
  const { mode, geminiKey } = useSettings();

  async function handleCompress() {
    if (!prompt.trim()) { toast.error("Enter a prompt first"); return; }
    setLoading(true);
    try {
      // Compression is local, so this works in both modes without a key.
      const res = await compressPrompt(prompt);
      setResult(res);
      addEntry({
        originalPrompt: prompt,
        optimizedPrompt: res.optimized,
        savedTokens: res.saved_tokens,
        savingsPercent: res.savings_percent,
        model: res.method,
        route: "compress",
        prompt,
        optimized: res.optimized,
      });
      toast.success(`Saved ${res.saved_tokens} tokens (${res.savings_percent}%)`);
    } catch (err) {
      toast.error(apiErrorMessage(err), { duration: 6000 });
    } finally {
      setLoading(false);
    }
  }

  async function handleEnhance() {
    if (!prompt.trim()) { toast.error("Enter a prompt first"); return; }
    if (mode === "ai" && !geminiKey) { toast.error("AI mode needs your Gemini API key. Add it in Settings."); return; }
    setLoading(true);
    try {
      const res = await enhancePrompt(prompt, { mode, geminiKey });
      setPrompt(res.enhanced);
      toast.success("Prompt enhanced");
    } catch (err) {
      toast.error(apiErrorMessage(err), { duration: 6000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-white">Prompt Compressor</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Remove filler and shrink a prompt locally, with no API cost. Enhance fixes grammar
          (needs a model: Ollama, or AI mode).
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste your prompt here…"
          rows={8}
          className="mt-5 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm leading-7 text-white placeholder-gray-600 outline-none focus:border-orange-400/40"
        />

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={handleCompress} disabled={loading || !prompt.trim()}>
            {loading ? <Loader size="sm" className="inline" /> : null}
            {loading ? " Working…" : "Compress"}
          </Button>
          <Button variant="secondary" onClick={handleEnhance} disabled={loading || !prompt.trim()}>
            Enhance
          </Button>
          <Button variant="ghost" onClick={() => { setPrompt(""); setResult(null); }} className="ml-auto text-gray-500">
            Clear
          </Button>
        </div>
      </Card>

      {result && <OptimizationResult result={result} />}
    </div>
  );
}
