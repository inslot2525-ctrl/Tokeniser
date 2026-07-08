import { useState } from "react";
import { Copy, CheckCircle } from "lucide-react";
import { diffWords } from "diff";
import type { OptimizeResponse } from "../../types/api";

interface Props {
  result: OptimizeResponse;
}

export default function OptimizationResult({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const score = Math.min(Math.floor(result.savings_percent * 2), 100);
  const rank =
    score > 90 ? "Diamond" :
    score > 70 ? "Platinum" :
    score > 50 ? "Gold" :
    score > 30 ? "Silver" : "Bronze";

  const rankColor =
    rank === "Diamond" ? "text-cyan-400" :
    rank === "Platinum" ? "text-purple-400" :
    rank === "Gold" ? "text-yellow-400" :
    rank === "Silver" ? "text-gray-300" : "text-orange-600";

  async function handleCopy() {
    await navigator.clipboard.writeText(result.optimized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const diff = diffWords(result.original, result.optimized);

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Original Tokens",  value: result.original_tokens },
          { label: "Optimized Tokens", value: result.optimized_tokens },
          { label: "Tokens Saved",     value: result.saved_tokens, green: true },
          { label: "Reduction",        value: `${result.savings_percent}%`, green: true },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-[#101010] p-5">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`mt-2 text-3xl font-bold ${s.green ? "text-green-400" : "text-white"}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Score card */}
      <div className="rounded-2xl border border-white/10 bg-[#101010] px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Efficiency Score</p>
            <p className="mt-1 text-3xl font-bold text-white">{score}<span className="text-lg text-gray-500">/100</span></p>
          </div>
          <p className={`text-2xl font-black ${rankColor}`}>{rank}</p>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Diff viewer */}
      <div className="rounded-2xl border border-white/10 bg-[#101010] p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-400">Prompt Diff</h3>
        <div className="leading-8 text-sm">
          {diff.map((part, i) => (
            <span
              key={i}
              className={
                part.added
                  ? "rounded bg-green-500/20 px-1 text-green-400"
                  : part.removed
                  ? "rounded bg-red-500/20 px-1 text-red-400 line-through"
                  : "text-gray-300"
              }
            >
              {part.value}
            </span>
          ))}
        </div>
      </div>

      {/* Original / Optimized side-by-side */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#101010] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Original</p>
          <pre className="whitespace-pre-wrap text-sm leading-7 text-gray-300">{result.original}</pre>
        </div>
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-500">Optimized</p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400 hover:bg-green-500/30"
            >
              {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm leading-7 text-green-100">{result.optimized}</pre>
        </div>
      </div>
    </div>
  );
}
