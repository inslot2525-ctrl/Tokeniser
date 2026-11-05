import { AlertTriangle, ShieldCheck, Info } from "lucide-react";
import type { ContractReport } from "../../types/api";

type Term = { kind: string; text: string };

function Chips({ terms, tone }: { terms: Term[]; tone: "amber" | "green" }) {
  const style =
    tone === "amber"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
      : "border-green-500/30 bg-green-500/10 text-green-300";
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {terms.map((t, i) => (
        <span key={i} className={`rounded-full border px-2.5 py-0.5 text-xs ${style}`}>
          <span className="opacity-60">{t.kind}</span> {t.text}
        </span>
      ))}
    </div>
  );
}

/** What the prompt requires (numbers, negations, limits, text to reproduce) and
 * whether the optimized prompt still states it. Renders nothing when there is
 * nothing to report. */
export default function ContractCard({ contract }: { contract: ContractReport | null | undefined }) {
  if (!contract || (contract.terms === 0 && !contract.verbatim && contract.reverted.length === 0)) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 px-6 py-4 text-sm" data-testid="contract-card">
      <h3 className="mb-2 text-sm font-semibold text-gray-400">Prompt contract</h3>

      {contract.verbatim && (
        <p className="flex items-start gap-2 text-sky-200">
          <Info size={16} className="mt-0.5 shrink-0" />
          Not compressed: this prompt asks to be reproduced word for word, or refers to its own words by position.
        </p>
      )}

      {contract.reverted.length > 0 && (
        <div className="text-amber-300">
          <p className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            LLMLingua-2's output was discarded because it dropped the following, so only the filler removal was kept:
          </p>
          <Chips terms={contract.reverted} tone="amber" />
        </div>
      )}

      {contract.lost.length > 0 ? (
        <div className="mt-3 text-amber-300">
          <p className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            The optimized prompt no longer states {contract.lost.length} of {contract.terms} requirements:
          </p>
          <Chips terms={contract.lost} tone="amber" />
        </div>
      ) : (
        !contract.verbatim &&
        contract.terms > 0 && (
          <p className="mt-1 flex items-start gap-2 text-green-300">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            All {contract.terms} requirements are still stated in the optimized prompt.
          </p>
        )
      )}
    </div>
  );
}
