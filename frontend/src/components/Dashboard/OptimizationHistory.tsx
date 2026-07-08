import { useHistory } from "../../context/HistoryContext";
import { Clock, Trash2 } from "lucide-react";

export default function OptimizationHistory() {
  const { history, clearHistory } = useHistory();

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#101010] p-8 text-center">
        <Clock size={36} className="mx-auto text-gray-700" />
        <p className="mt-4 text-sm text-gray-500">No optimization history yet</p>
      </div>
    );
  }

  const totalSaved = history.reduce((s, e) => s + (e.savedTokens ?? 0), 0);
  const avgSavings = (history.reduce((s, e) => s + (e.savingsPercent ?? 0), 0) / history.length).toFixed(1);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#101010] p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Optimization History</h2>
        <button
          onClick={clearHistory}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-500 hover:border-red-500/30 hover:text-red-400"
        >
          <Trash2 size={12} />
          Clear
        </button>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "Total Runs",    value: history.length },
          { label: "Tokens Saved",  value: totalSaved.toLocaleString() },
          { label: "Avg Savings",   value: `${avgSavings}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-black/40 p-3 text-center">
            <p className="text-lg font-bold text-orange-400">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="mt-5 space-y-2">
        {history.slice(0, 8).map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-300">{entry.originalPrompt}</p>
              <p className="text-xs text-gray-600">{entry.model} · {entry.timestamp}</p>
            </div>
            <div className="ml-4 shrink-0 text-right">
              <p className="text-sm font-semibold text-green-400">-{entry.savingsPercent ?? 0}%</p>
              <p className="text-xs text-gray-600">{entry.savedTokens ?? 0} tokens</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
