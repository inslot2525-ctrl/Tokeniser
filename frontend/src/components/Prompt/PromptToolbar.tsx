import { Sparkles, Minimize2, Trash2, Copy, Square, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAgentContext } from "../../context/AgentContext";
import { useSettings } from "../../context/SettingsContext";
import { apiErrorMessage, enhancePrompt } from "../../services/api";
import type { Mode } from "../../types/api";
import Button from "../Common/Button";
import toast from "react-hot-toast";

interface Props {
  onRun: () => void;
  onStop: () => void;
}

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: "free", label: "Free", hint: "Rules and local models only. Nothing is sent to Gemini." },
  { value: "ai", label: "AI", hint: "Uses Gemini with your own API key." },
];

export default function PromptToolbar({ onRun, onStop }: Props) {
  const { prompt, setPrompt, isLoading } = useAgentContext();
  const { mode, setMode, geminiKey } = useSettings();
  const needsKey = mode === "ai" && !geminiKey;

  async function handleCopy() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    toast.success("Copied to clipboard");
  }

  async function handleEnhance() {
    if (!prompt.trim()) return;
    try {
      const res = await enhancePrompt(prompt, { mode, geminiKey });
      setPrompt(res.enhanced);
      toast.success("Prompt enhanced");
    } catch (err) {
      toast.error(apiErrorMessage(err), { duration: 6000 });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#101010] px-6 py-4">
      {/* Run / Stop — mutually exclusive */}
      {isLoading ? (
        <button
          onClick={onStop}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
        >
          <Square size={14} fill="currentColor" />
          Stop
        </button>
      ) : (
        <Button
          onClick={onRun}
          disabled={!prompt.trim() || needsKey}
          className="flex items-center gap-2"
        >
          <Sparkles size={15} />
          Run Agent
        </Button>
      )}

      {/* Free / AI mode */}
      <div
        role="radiogroup"
        aria-label="Mode"
        className="flex rounded-xl border border-white/10 bg-black/40 p-1"
      >
        {MODES.map((m) => (
          <button
            key={m.value}
            role="radio"
            aria-checked={mode === m.value}
            title={m.hint}
            disabled={isLoading}
            onClick={() => setMode(m.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              mode === m.value
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {needsKey && (
        <Link
          to="/settings"
          className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300"
        >
          <KeyRound size={13} />
          Add your Gemini key
        </Link>
      )}

      <Button
        variant="secondary"
        onClick={handleEnhance}
        disabled={isLoading || !prompt.trim() || needsKey}
        title={mode === "free" ? "Grammar fixes need a model: Ollama locally, or AI mode" : undefined}
        className="flex items-center gap-2"
      >
        <Minimize2 size={15} />
        Enhance
      </Button>

      <Button
        variant="secondary"
        onClick={handleCopy}
        disabled={!prompt.trim()}
        className="flex items-center gap-2"
      >
        <Copy size={15} />
        Copy
      </Button>

      <Button
        variant="ghost"
        onClick={() => setPrompt("")}
        disabled={isLoading}
        className="ml-auto flex items-center gap-2 text-gray-500"
      >
        <Trash2 size={15} />
        Clear
      </Button>
    </div>
  );
}
