import { Sparkles, Minimize2, Trash2, Copy, Square } from "lucide-react";
import { useAgentContext } from "../../context/AgentContext";
import { enhancePrompt } from "../../services/api";
import Button from "../Common/Button";
import toast from "react-hot-toast";

interface Props {
  onRun: () => void;
  onStop: () => void;
}

export default function PromptToolbar({ onRun, onStop }: Props) {
  const { prompt, setPrompt, isLoading } = useAgentContext();

  async function handleCopy() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    toast.success("Copied to clipboard");
  }

  async function handleEnhance() {
    if (!prompt.trim()) return;
    try {
      const res = await enhancePrompt(prompt);
      setPrompt(res.enhanced);
      toast.success("Prompt enhanced");
    } catch {
      toast.error("Enhance failed — is the backend running?");
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
          disabled={!prompt.trim()}
          className="flex items-center gap-2"
        >
          <Sparkles size={15} />
          Run Agent
        </Button>
      )}

      <Button
        variant="secondary"
        onClick={handleEnhance}
        disabled={isLoading || !prompt.trim()}
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
