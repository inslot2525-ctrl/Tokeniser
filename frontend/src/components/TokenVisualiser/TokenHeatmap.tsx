interface Props {
  text: string;
}

// Roughly score each word by length — longer words cost more tokens
function tokenWeight(word: string): number {
  const len = word.length;
  if (len <= 3) return 0;
  if (len <= 6) return 1;
  if (len <= 10) return 2;
  return 3;
}

const HEAT: Record<number, string> = {
  0: "bg-white/5 text-gray-400",
  1: "bg-yellow-500/20 text-yellow-300",
  2: "bg-orange-500/30 text-orange-300",
  3: "bg-red-500/40 text-red-300",
};

export default function TokenHeatmap({ text }: Props) {
  if (!text.trim()) return null;

  const words = text.split(/(\s+)/);

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-[#101010] p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
        Token Heat Map
      </p>
      <div className="flex flex-wrap gap-1 leading-8">
        {words.map((chunk, i) => {
          if (/^\s+$/.test(chunk)) return <span key={i}> </span>;
          const heat = tokenWeight(chunk);
          return (
            <span
              key={i}
              title={`~${heat + 1} token${heat > 0 ? "s" : ""}`}
              className={`rounded px-1 py-0.5 text-sm transition ${HEAT[heat]}`}
            >
              {chunk}
            </span>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-white/5" /> Low cost
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-yellow-500/30" /> Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-orange-500/40" /> High
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-red-500/50" /> Heavy
        </span>
      </div>
    </div>
  );
}
