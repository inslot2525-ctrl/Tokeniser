import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, LoaderCircle, Circle } from "lucide-react";
import { useAgentContext } from "../../context/AgentContext";
import { isWarningStep } from "../../utils/steps";

// Shown while a request is in flight. Once the response arrives, the list is
// replaced by the steps the backend actually ran.
const PENDING_STEPS = ["Risk check", "Compress", "Route", "Answer", "Check"];

type StepStatus = "waiting" | "running" | "completed" | "warning";

export default function LiveExecution() {
  const { isLoading, result, runId } = useAgentContext();
  // Progress is keyed by run, so a new run starts at -1 without a reset render.
  const [progress, setProgress] = useState({ runId, index: -1 });

  useEffect(() => {
    if (!isLoading || result) return;

    let index = 0;
    const timer = setInterval(() => {
      setProgress({ runId, index });
      index++;
      if (index === PENDING_STEPS.length) clearInterval(timer);
    }, 700);

    return () => clearInterval(timer);
  }, [isLoading, result, runId]);

  const STEPS = result?.steps?.length ? result.steps : PENDING_STEPS;
  const current = result
    ? STEPS.length
    : isLoading && progress.runId === runId
    ? progress.index
    : -1;

  function getStatus(index: number, step: string): StepStatus {
    if (index < current) return result && isWarningStep(step) ? "warning" : "completed";
    if (index === current) return "running";
    return "waiting";
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#101010] p-8">
      <h2 className="mb-8 text-2xl font-bold text-white">Live Execution</h2>

      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const status = getStatus(index, step);
          const s = STYLES[status];

          return (
            <div
              key={step}
              className={`flex items-center justify-between gap-4 rounded-xl border px-5 py-4 transition-all duration-300 ${s.row}`}
            >
              <div className="flex items-center gap-4">
                <s.Icon size={18} className={`shrink-0 ${s.icon}`} />
                <span className={`font-medium ${s.text}`}>{step}</span>
              </div>

              <span className={`shrink-0 text-xs font-semibold uppercase tracking-widest ${s.label}`}>
                {status === "warning" ? "note" : status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STYLES: Record<StepStatus, { row: string; text: string; label: string; icon: string; Icon: typeof Circle }> = {
  completed: { row: "border-green-500/30 bg-green-500/5", text: "text-green-400", label: "text-green-500", icon: "text-green-500", Icon: CheckCircle2 },
  warning: { row: "border-amber-500/30 bg-amber-500/5", text: "text-amber-300", label: "text-amber-400", icon: "text-amber-400", Icon: AlertTriangle },
  running: { row: "border-orange-500/50 bg-orange-500/10", text: "text-orange-400", label: "text-orange-500", icon: "animate-spin text-orange-500", Icon: LoaderCircle },
  waiting: { row: "border-white/5 bg-[#181818]", text: "text-gray-500", label: "text-gray-700", icon: "text-gray-700", Icon: Circle },
};
