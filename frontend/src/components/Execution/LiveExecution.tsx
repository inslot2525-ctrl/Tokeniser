import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, Circle } from "lucide-react";
import { useAgentContext } from "../../context/AgentContext";

const STEPS = [
  "Planner",
  "Enhancer",
  "Compressor",
  "Optimizer",
  "Risk Detector",
  "Router",
  "Verifier",
];

type StepStatus = "waiting" | "running" | "completed";

export default function LiveExecution() {
  const { isLoading, result, runId } = useAgentContext();
  const [current, setCurrent] = useState(-1);

  useEffect(() => {
    if (!isLoading && !result) {
      setCurrent(-1);
      return;
    }

    if (result) {
      setCurrent(STEPS.length); // all complete
      return;
    }

    // reset and animate from 0
    setCurrent(-1);
    let index = 0;
    const timer = setInterval(() => {
      setCurrent(index);
      index++;
      if (index === STEPS.length) clearInterval(timer);
    }, 700);

    return () => clearInterval(timer);
  }, [isLoading, result, runId]);

  function getStatus(index: number): StepStatus {
    if (index < current) return "completed";
    if (index === current) return "running";
    return "waiting";
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#101010] p-8">
      <h2 className="mb-8 text-2xl font-bold text-white">Live Execution</h2>

      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const status = getStatus(index);

          return (
            <div
              key={step}
              className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-all duration-300 ${
                status === "completed"
                  ? "border-green-500/30 bg-green-500/5"
                  : status === "running"
                  ? "border-orange-500/50 bg-orange-500/10"
                  : "border-white/5 bg-[#181818]"
              }`}
            >
              <div className="flex items-center gap-4">
                {status === "completed" ? (
                  <CheckCircle2 size={18} className="text-green-500" />
                ) : status === "running" ? (
                  <LoaderCircle size={18} className="animate-spin text-orange-500" />
                ) : (
                  <Circle size={18} className="text-gray-700" />
                )}

                <span
                  className={`font-medium ${
                    status === "completed"
                      ? "text-green-400"
                      : status === "running"
                      ? "text-orange-400"
                      : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>

              <span
                className={`text-xs font-semibold uppercase tracking-widest ${
                  status === "completed"
                    ? "text-green-500"
                    : status === "running"
                    ? "text-orange-500"
                    : "text-gray-700"
                }`}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
