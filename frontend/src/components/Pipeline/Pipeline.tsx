import {
  Brain,
  Sparkles,
  Minimize2,
  Route,
  ShieldCheck,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAgentContext } from "../../context/AgentContext";

const STAGES = [
  { title: "Planner",   desc: "Analyse intent & complexity",  icon: Brain },
  { title: "Enhancer",  desc: "Grammar & clarity pass",       icon: Sparkles },
  { title: "Optimizer", desc: "Token compression",            icon: Minimize2 },
  { title: "Router",    desc: "Select optimal model",         icon: Route },
  { title: "Verifier",  desc: "Validate & score response",    icon: ShieldCheck },
];

export default function Pipeline() {
  const { result, isLoading, runId } = useAgentContext();
  const [activeStage, setActiveStage] = useState(-1);

  // Animate through stages while loading, freeze at end when result arrives
  // runId in deps forces re-animation on each new run
  useEffect(() => {
    if (!isLoading && !result) {
      setActiveStage(-1);
      return;
    }

    if (result) {
      setActiveStage(STAGES.length); // all complete
      return;
    }

    // reset and animate from 0
    setActiveStage(-1);
    let current = 0;
    const interval = setInterval(() => {
      setActiveStage(current);
      current++;
      if (current >= STAGES.length) clearInterval(interval);
    }, 600);

    return () => clearInterval(interval);
  }, [isLoading, result, runId]);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#101010] p-8">
      <h2 className="mb-8 text-2xl font-bold text-white">Processing Pipeline</h2>

      <div className="flex items-start gap-0">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const completed = activeStage > index;
          const running = activeStage === index;

          return (
            <div key={stage.title} className="flex flex-1 flex-col items-center text-center">
              {/* Connector line + dot row */}
              <div className="relative flex w-full items-center">
                {/* Left line */}
                <div
                  className={`h-0.5 flex-1 transition-all duration-500 ${
                    index === 0 ? "opacity-0" : completed ? "bg-orange-500" : "bg-white/10"
                  }`}
                />

                {/* Circle */}
                <div
                  className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    completed
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : running
                      ? "border-orange-500 bg-orange-500/20 text-orange-400"
                      : "border-white/10 bg-white/5 text-gray-600"
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 size={20} />
                  ) : running ? (
                    <LoaderCircle size={20} className="animate-spin" />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>

                {/* Right line */}
                <div
                  className={`h-0.5 flex-1 transition-all duration-500 ${
                    index === STAGES.length - 1 ? "opacity-0" : completed ? "bg-orange-500" : "bg-white/10"
                  }`}
                />
              </div>

              {/* Label */}
              <div className="mt-3 px-1">
                <p
                  className={`text-sm font-semibold transition-colors ${
                    completed
                      ? "text-green-400"
                      : running
                      ? "text-orange-400"
                      : "text-gray-500"
                  }`}
                >
                  {stage.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
