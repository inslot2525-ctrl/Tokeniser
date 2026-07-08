interface Props {
  originalTokens: number;
  optimizedTokens: number;
  contextWindow: number;
}

export default function ChatSimulator({ originalTokens, optimizedTokens, contextWindow }: Props) {
  const origCap  = originalTokens  > 0 ? Math.floor(contextWindow / originalTokens)  : 0;
  const optCap   = optimizedTokens > 0 ? Math.floor(contextWindow / optimizedTokens) : 0;
  const improvement = optCap - origCap;

  // Bar widths — original is always 100%, optimised is scaled relative
  const origPct = 100;
  const optPct  = origCap > 0 ? Math.min((optCap / origCap) * 100, 100) : 100;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#101010] p-6">
      <h2 className="mb-6 text-lg font-semibold text-white">Conversation Simulator</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Original */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-400">Original Prompt</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-red-500" style={{ width: `${origPct}%` }} />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{origCap.toLocaleString()}</p>
          <p className="text-xs text-gray-500">messages per context</p>
          <p className="mt-2 text-xs text-red-400">Context fills faster</p>
        </div>

        {/* Optimized */}
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-green-400">Optimized Prompt</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${optPct}%` }} />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{optCap.toLocaleString()}</p>
          <p className="text-xs text-gray-500">messages per context</p>
          <p className="mt-2 text-xs text-green-400">More conversations possible</p>
        </div>
      </div>

      {improvement > 0 && (
        <div className="mt-5 rounded-xl border border-orange-500/25 bg-orange-500/10 px-5 py-3 text-center text-sm font-semibold text-orange-300">
          🚀 +{improvement.toLocaleString()} additional prompt runs unlocked
        </div>
      )}
    </div>
  );
}
