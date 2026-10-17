import { Copy, CheckCircle, Brain, Cpu, Route, DollarSign, Zap, ShieldCheck, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";
import { useAgentContext } from "../../context/AgentContext";
import { isWarningStep } from "../../utils/steps";

export default function ResponseCard() {
  const { result } = useAgentContext();
  const [copied, setCopied] = useState<"response" | "prompt" | null>(null);

  if (!result) {
    return (
      <div id="response-card" className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#101010] py-20 text-center">
        <Brain size={52} className="text-gray-700" />
        <p className="mt-5 text-lg font-semibold text-gray-500">No response yet</p>
        <p className="mt-2 text-sm text-gray-700">Run a prompt to see results here</p>
      </div>
    );
  }

  const answered = result.response !== null;

  async function copy(what: "response" | "prompt") {
    await navigator.clipboard.writeText(
      what === "response" ? result!.response ?? "" : result!.processed_prompt
    );
    setCopied(what);
    setTimeout(() => setCopied(null), 2000);
  }

  const { tokens } = result;
  const meta = [
    { icon: Cpu, label: "Model", value: result.model },
    { icon: Route, label: "Route", value: result.route },
    {
      icon: Brain,
      label: "Judge score",
      value: result.confidence !== null ? `${result.confidence}%` : "—",
      hint: result.confidence === null ? "Only scored when the Gemini judge runs (AI mode, local answers)" : undefined,
    },
    { icon: DollarSign, label: "Est. Cost", value: result.estimated_remote_cost },
    ...(tokens.saved > 0
      ? [{ icon: Zap, label: "Tokens Saved", value: `${tokens.saved} (${Math.round((tokens.saved / tokens.original) * 100)}%)` }]
      : []),
  ];

  return (
    <div id="response-card" className="rounded-3xl border border-white/10 bg-[#101010] p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">Response</h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              result.mode === "ai"
                ? "bg-orange-500/15 text-orange-300"
                : "bg-emerald-500/15 text-emerald-300"
            }`}
          >
            {result.mode === "ai" ? "AI · Gemini" : "Free · rules"}
          </span>
        </div>
        {answered && (
          <CopyButton onClick={() => copy("response")} done={copied === "response"} label="Copy" />
        )}
      </div>

      {/* Meta grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {meta.map((m) => (
          <div
            key={m.label}
            title={"hint" in m ? m.hint : undefined}
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

      {/* Not answered: the optimized prompt is the result */}
      {!answered && (
        <div className="mt-7 flex gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 px-5 py-4 text-sm text-sky-200">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p>
            No model ran: free mode has no local model available here. Copy the optimized
            prompt below into the AI tool you already use
            {result.analysis?.recommended_route === "Gemini" ? " (this one needs a strong model)" : ""}
            , or switch to AI mode with your Gemini key.
          </p>
        </div>
      )}

      {/* Planner reason */}
      {result.planner_reason && (
        <Section title="Planner Reasoning" value={result.planner_reason} />
      )}

      {/* Optimized prompt */}
      {result.processed_prompt && (
        <Section
          title="Optimized Prompt"
          value={result.processed_prompt}
          accent
          action={!answered ? (
            <CopyButton onClick={() => copy("prompt")} done={copied === "prompt"} label="Copy prompt" />
          ) : undefined}
        />
      )}

      {/* Final response */}
      {answered && <Section title="Final Response" value={result.response!} />}

      {/* Rule checks */}
      {result.checks && (
        <div className="mt-7">
          <h3 className="mb-3 text-sm font-semibold text-gray-400">Answer Checks</h3>
          {result.checks.passed ? (
            <p className="flex items-center gap-2 text-sm text-emerald-300">
              <ShieldCheck size={16} /> All rule checks passed
            </p>
          ) : (
            <ul className="space-y-1.5">
              {result.checks.issues.map((issue) => (
                <li key={issue} className="flex items-start gap-2 text-sm text-amber-300">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {issue}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Steps */}
      {result.steps?.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-gray-400">Processing Steps</h3>
          <div className="flex flex-wrap gap-2">
            {result.steps.map((step, i) => {
              const warn = isWarningStep(step);
              return (
                <span
                  key={i}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    warn
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      : "border-orange-500/30 bg-orange-500/10 text-orange-300"
                  }`}
                >
                  {warn ? "!" : "✓"} {step}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CopyButton({ onClick, done, label }: { onClick: () => void; done: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold hover:bg-orange-400"
    >
      {done ? <CheckCircle size={16} /> : <Copy size={16} />}
      {done ? "Copied" : label}
    </button>
  );
}

function Section({
  title,
  value,
  accent = false,
  action,
}: {
  title: string;
  value: string;
  accent?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400">{title}</h3>
        {action}
      </div>
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
