import { useAgentContext } from "../../context/AgentContext";
import useAgents from "../../hooks/useAgents";
import { useHistory } from "../../context/HistoryContext";
import { useSettings } from "../../context/SettingsContext";

import PromptEditor from "../Prompt/PromptEditor";
import PromptToolbar from "../Prompt/PromptToolbar";
import PromptStats from "../Prompt/PromptStats";
import Pipeline from "../Pipeline/Pipeline";
import LiveExecution from "../Execution/LiveExecution";
import ResponseCard from "../Response/ResponseCard";

import toast from "react-hot-toast";

export default function Workspace() {
  const { prompt, setResult, setIsLoading, setError, startNewRun, stopRun } = useAgentContext();
  const { mode, geminiKey } = useSettings();
  const { execute, cancel } = useAgents();
  const { addEntry } = useHistory();

  function handleStop() {
    cancel();   // abort the in-flight HTTP request
    stopRun();  // reset context loading state
    toast("Stopped", { icon: "⛔" });
  }

  async function handleRun() {
    if (!prompt.trim()) {
      toast.error("Enter a prompt first");
      return;
    }

    if (mode === "ai" && !geminiKey) {
      toast.error("AI mode needs your Gemini API key. Add it in Settings.");
      return;
    }

    startNewRun();

    const { response, error, cancelled } = await execute(prompt, { mode, geminiKey });

    if (response) {
      setResult(response);
      const { tokens } = response;
      addEntry({
        route: response.route,
        model: response.model,
        prompt: response.original_prompt,
        optimized: response.processed_prompt,
        originalPrompt: response.original_prompt,
        optimizedPrompt: response.processed_prompt,
        savedTokens: tokens.saved,
        savingsPercent: tokens.original ? Math.round((tokens.saved / tokens.original) * 100) : 0,
        confidence: response.judge_score ?? undefined,
      });
      toast.success(
        response.response === null ? "Prompt optimized (no model ran)" : "Agent completed"
      );

      // Scroll to response after a short delay so the DOM has rendered
      setTimeout(() => {
        document.getElementById("response-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else if (!cancelled) {
      setError(error);
      toast.error(error, { duration: 6000 });
    }

    setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      <PromptEditor onSubmit={handleRun} />
      <PromptToolbar onRun={handleRun} onStop={handleStop} />
      <PromptStats />

      <Pipeline />
      <LiveExecution />
      <ResponseCard />
    </div>
  );
}
