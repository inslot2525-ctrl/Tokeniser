import { useState } from "react";
import useAgent from "../../hooks/useAgents";
import { useAgentContext } from "../../context/AgentContext";

export default function PromptBox() {
  const [prompt, setPrompt] = useState("");
  const { execute, loading, error } = useAgent();
  const { setResult } = useAgentContext();

  async function handleSubmit() {
    if (!prompt.trim()) return;
    const response = await execute(prompt);
    if (response) setResult(response);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#101010] p-8">
      <h2 className="mb-6 text-3xl font-bold">AI Prompt Optimizer</h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
        className="h-56 w-full resize-none rounded-2xl border border-white/10 bg-black p-5 text-white outline-none focus:border-orange-400"
      />

      <div className="mt-5 flex items-center justify-between">
        <span className="text-gray-400 text-sm">Characters: {prompt.length}</span>

        <div className="flex gap-3">
          <button
            onClick={() => setPrompt("")}
            className="rounded-xl border border-white/10 px-5 py-3 hover:bg-white/5"
          >
            Clear
          </button>
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="rounded-xl bg-orange-500 px-8 py-3 hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Processing…" : "Optimize"}
          </button>
        </div>
      </div>

      {error && <div className="mt-5 text-red-400">{error}</div>}
    </div>
  );
}
