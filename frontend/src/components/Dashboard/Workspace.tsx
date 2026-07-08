import { useAgentContext } from "../../context/AgentContext";
import useAgents from "../../hooks/useAgents";
import { useHistory } from "../../context/HistoryContext";

import PromptEditor from "../Prompt/PromptEditor";
import PromptToolbar from "../Prompt/PromptToolbar";
import PromptStats from "../Prompt/PromptStats";
import Pipeline from "../Pipeline/Pipeline";
import LiveExecution from "../Execution/LiveExecution";
import ResponseCard from "../Response/ResponseCard";

import toast from "react-hot-toast";

export default function Workspace() {
  const { prompt, setResult, setIsLoading, error, startNewRun } = useAgentContext();
  const { execute } = useAgents();
  const { addEntry } = useHistory();

  async function handleRun() {
    if (!prompt.trim()) {
      toast.error("Enter a prompt first");
      return;
    }

    // clears result + error, bumps runId, sets isLoading — all atomically
    startNewRun();

    const response = await execute(prompt);

    if (response) {
      setResult(response);
      addEntry({
        route: response.route,
        model: response.model,
        prompt: response.original_prompt,
        optimized: response.processed_prompt,
        originalPrompt: response.original_prompt,
        optimizedPrompt: response.processed_prompt,
        savedTokens: 0,
        savingsPercent: 0,
        confidence: response.confidence,
      });
      toast.success("Agent completed successfully");
    } else {
      toast.error("Agent failed — check the backend");
    }

    setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      <PromptEditor onSubmit={handleRun} />
      <PromptToolbar onRun={handleRun} />
      <PromptStats />

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <Pipeline />
      <LiveExecution />
      <ResponseCard />
    </div>
  );
}
