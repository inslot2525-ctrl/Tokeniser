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
  const { prompt, setResult, setIsLoading, error, startNewRun, stopRun } = useAgentContext();
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
      toast.success("Agent completed");

      // Scroll to response after a short delay so the DOM has rendered
      setTimeout(() => {
        document.getElementById("response-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else if (error !== "Stopped by user") {
      toast.error("Agent failed — check the backend");
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
