import { useAgentContext } from "../../context/AgentContext";

interface Props {
  onSubmit: () => void;
}

export default function PromptEditor({ onSubmit }: Props) {
  const { prompt, setPrompt, isLoading } = useAgentContext();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#101010]">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Prompt</h2>
        <span className="text-xs text-gray-500">⌘ / Ctrl + Enter to run</span>
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your prompt here…"
        disabled={isLoading}
        className="h-56 w-full resize-none bg-transparent px-6 py-5 text-sm leading-7 text-white placeholder-gray-600 outline-none disabled:opacity-50"
      />
    </div>
  );
}
