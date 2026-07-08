import { Copy, CheckCircle, Brain, Cpu, Route, DollarSign, Zap } from "lucide-react";
import { useState } from "react";
import { useAgentContext } from "../../context/AgentContext";

export default function ResponseCard() {
  const { result } = useAgentContext();
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div id="response-card" className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#101010] py-20 text-center">
        <Brain size={52} className="text-gray-700" />
        <p className="mt-5 text-lg font-semibold text-gray-500">No response yet</p>
        <p className="mt-2 text-sm text-gray-700">Run a prompt to see results here</p>
      </div>
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result!.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Derive token savings from prompt length diff as the agent doesn't return token counts
  const charsSaved = result.original_prompt.length - result.processed_prompt.length;

  const meta = [
    { icon: Cpu,        label: "Model",        value: result.model },
    { icon: Route,      label: "Route",        value: result.route },
    { icon: Brain,      label: "Confidence",   value: `${result.confidence}%` },
    { icon: DollarSign, label: "Est. Cost",    value: result.estimated_remote_cost },
    ...(charsSaved > 0
      ? [{ icon: Zap, label: "Chars Saved", value: charsSaved.toLocaleString() }]
      : []),
  ];

  return (
    <div id="response-card" className="rounded-3xl border border-white/10 bg-[#101010] p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Response</h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold hover:bg-orange-400"
        >
          {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Meta grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {meta.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-white/10 bg-black/40 p-4"
          >
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <m.icon size={13} />
              {m.label}
            </div>
            <p className="mt-1.5 text-sm font-semibold text-white">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Planner reason */}
      {result.planner_reason && (
        <Section title="Planner Reasoning" value={result.planner_reason} />
      )}

      {/* Optimized prompt */}
      {result.processed_prompt && (
        <Section title="Optimized Prompt" value={result.processed_prompt} accent />
      )}

      {/* Final response */}
      <Section title="Final Response" value={result.response} />

      {/* Steps */}
      {result.steps?.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-gray-400">Processing Steps</h3>
          <div className="flex flex-wrap gap-2">
            {result.steps.map((step, i) => (
              <span
                key={i}
                className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-300"
              >
                ✓ {step}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  value,
  accent = false,
}: {
  title: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="mt-7">
      <h3 className="mb-3 text-sm font-semibold text-gray-400">{title}</h3>
      <div
        className={`rounded-2xl border px-6 py-5 text-sm leading-7 whitespace-pre-wrap ${
          accent
            ? "border-orange-500/20 bg-orange-500/5 text-orange-100"
            : "border-white/10 bg-black/40 text-gray-300"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
