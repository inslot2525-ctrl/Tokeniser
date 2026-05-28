interface Props {
  result: any
}

export default function OptimizationResult({
  result,
}: Props) {
  if (!result) return null

  return (
    <div className="optimization-grid">
      <div className="glass result-card">
        <h3>Original</h3>

        <p>{result.original}</p>
      </div>

      <div className="glass result-card">
        <h3>Optimized</h3>

        <p>{result.optimized}</p>
      </div>

      <div className="glass savings-banner">
        <h2>
          Saved {result.saved_tokens} tokens
        </h2>

        <p>
          {result.savings_percent}% reduction
        </p>
      </div>
    </div>
  )
}