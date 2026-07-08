import { useAgentContext } from "../../context/AgentContext";

function approxTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export default function PromptStats() {
  const { prompt, result } = useAgentContext();

  const chars = prompt.length;
  const tokens = approxTokens(prompt);
  const saved = result ? (result.original_prompt.length - result.processed_prompt.length) : null;
  const savings = result
    ? saved != null && result.original_prompt.length > 0
      ? ((saved / result.original_prompt.length) * 100).toFixed(1)
      : "0"
    : null;

  const stats = [
    { label: "Characters", value: chars.toLocaleString(), glow: false },
    { label: "Est. Tokens", value: tokens.toLocaleString(), glow: false },
    {
      label: "Chars Saved",
      value: saved != null ? saved.toLocaleString() : "—",
      glow: saved != null && saved > 0,
    },
    {
      label: "Savings",
      value: savings != null ? `${savings}%` : "—",
      glow: savings != null && parseFloat(savings) > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-white/10 bg-[#101010] px-5 py-4"
        >
          <p className="text-xs text-gray-500">{s.label}</p>
          <p className={`mt-1 text-2xl font-bold ${s.glow ? "text-orange-400" : "text-white"}`}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
