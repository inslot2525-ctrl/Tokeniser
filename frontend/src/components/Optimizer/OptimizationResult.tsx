import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  result: any;
}

export default function OptimizationResult({
  result,
}: Props) {
  const [copied, setCopied] =
    useState(false);

  if (!result) return null;

  const score = Math.min(
    Math.floor(
      result.savings_percent * 2.5
    ),
    100
  );

  let rank = "Bronze";

  if (score > 30) rank = "Silver";
  if (score > 50) rank = "Gold";
  if (score > 70) rank = "Platinum";
  if (score > 90) rank = "Diamond";

  async function copyPrompt() {
    await navigator.clipboard.writeText(
      result.optimized
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="optimization-grid">

      <div className="metrics-grid">

        <div className="metric-card glass">
          <h3>{result.original_tokens}</h3>
          <p>Original Tokens</p>
        </div>

        <div className="metric-card glass">
          <h3>{result.optimized_tokens}</h3>
          <p>Optimized Tokens</p>
        </div>

        <div className="metric-card glass">
          <h3>{result.saved_tokens}</h3>
          <p>Tokens Saved</p>
        </div>

        <div className="metric-card glass">
          <h3>
            {result.savings_percent}%
          </h3>
          <p>Reduction</p>
        </div>

      </div>

      <div className="glass score-card">

        <h2>
          Efficiency Score: {score}/100
        </h2>

        <p>
          Rank: {rank}
        </p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${result.savings_percent}%`,
            }}
          />
        </div>

      </div>

      <div className="glass result-card">

        <h3>Original Prompt</h3>

        <p>
          {result.original}
        </p>

      </div>

      <div className="glass result-card">

        <h3>Optimized Prompt</h3>

        <p>
          {result.optimized}
        </p>

      </div>

      <button
        className="copy-button"
        onClick={copyPrompt}
      >
        {copied ? (
          <>
            <CheckCircle size={18} />
            Copied
          </>
        ) : (
          <>
            <Copy size={18} />
            Copy Optimized Prompt
          </>
        )}
      </button>

    </div>
  );
}