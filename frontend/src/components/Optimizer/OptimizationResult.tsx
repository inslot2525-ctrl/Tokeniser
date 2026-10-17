import { useState } from "react";
import { Copy, CheckCircle } from "lucide-react";
import { diffWords } from "diff";
import type { CompressResponse } from "../../types/api";

interface Props {
  result: CompressResponse;
}

export default function OptimizationResult({ result }: Props) {
  const [copied, setCopied] = useState(false);

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

      {/* How it was compressed */}
      <div className="rounded-2xl border border-white/10 bg-[#101010] px-6 py-4 text-sm">
        <p className="text-gray-400">
          Compressed with <span className="font-semibold text-white">{result.method}</span>
          {" · "}
          <span className="text-green-400">0 API tokens spent</span>
        </p>
        {result.removed_phrases?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {result.removed_phrases.map((r, i) => (
              <span
                key={i}
                title={r.label}
                className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-0.5 text-xs text-red-300 line-through decoration-red-400/60"
              >
                {r.text}
              </span>
            ))}
          </div>
        )}
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
