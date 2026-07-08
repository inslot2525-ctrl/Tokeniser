interface Props {
  originalTokens: number;
  optimizedTokens: number;
  budget: number;
}

export default function BudgetPlanner({ originalTokens, optimizedTokens, budget }: Props) {
  const originalMsgs  = originalTokens  > 0 ? Math.floor(budget / originalTokens)  : 0;
  const optimizedMsgs = optimizedTokens > 0 ? Math.floor(budget / optimizedTokens) : 0;
  const extra  = optimizedMsgs - originalMsgs;
  const growth = originalMsgs > 0 ? ((extra / originalMsgs) * 100).toFixed(1) : "0";

  const rows = [
    { label: "Context Window",            value: budget.toLocaleString(),         sub: "tokens" },
    { label: "Messages Without Opt.",     value: originalMsgs.toLocaleString(),   sub: "per context" },
    { label: "Messages With Opt.",        value: optimizedMsgs.toLocaleString(),  sub: "per context", green: true },
    { label: "Extra Messages",            value: `+${extra.toLocaleString()}`,    sub: "gained",      green: true },
    { label: "Conversation Growth",       value: `+${growth}%`,                  sub: "improvement", green: true },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#101010] p-6">
      <h2 className="mb-5 text-lg font-semibold text-white">Token Budget Planner</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {rows.map((r) => (
          <div key={r.label} className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-gray-500">{r.label}</p>
            <p className={`mt-2 text-xl font-bold ${r.green ? "text-green-400" : "text-white"}`}>
              {r.value}
            </p>
            <p className="mt-0.5 text-xs text-gray-600">{r.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
