// Cost per 1M input tokens in USD
const PRICING: Record<string, number> = {
  "gpt-4o": 5.0,
  "gpt-3.5-turbo": 1.5,
  "claude-3-opus": 15.0,
  "gemini-pro": 0.5,
};

interface Props {
  modelName: string;
  originalTokens: number;
  optimizedTokens: number;
}

export default function CostCalculator({ modelName, originalTokens, optimizedTokens }: Props) {
  const costPer1M    = PRICING[modelName] ?? 5.0;
  const perToken     = costPer1M / 1_000_000;
  const originalCost  = originalTokens  * perToken;
  const optimizedCost = optimizedTokens * perToken;
  const saved         = originalCost - optimizedCost;
  const savingsPct    = originalCost > 0 ? ((saved / originalCost) * 100).toFixed(1) : "0";

  const rows = [
    { label: "Model",              value: modelName,                     plain: true },
    { label: "Before Optimization", value: `$${originalCost.toFixed(6)}`,  plain: true },
    { label: "After Optimization",  value: `$${optimizedCost.toFixed(6)}`, plain: true },
    { label: "Money Saved",         value: `$${saved.toFixed(6)}`,          green: true },
    { label: "Cost Reduction",      value: `${savingsPct}%`,                green: true },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#101010] p-6">
      <h2 className="mb-5 text-lg font-semibold text-white">Cost Calculator</h2>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 px-4 py-3">
            <span className="text-sm text-gray-400">{r.label}</span>
            <span className={`text-sm font-semibold ${r.green ? "text-green-400" : "text-white"}`}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
