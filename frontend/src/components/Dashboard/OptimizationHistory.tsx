interface HistoryItem {
  date: string
  savedTokens: number
  savingsPercent: number
}

interface Props {
  history: HistoryItem[]
}

export default function OptimizationHistory({
  history,
}: Props) {
  if (history.length === 0) {
    return (
      <div className="glass history-card">
        <h2>Optimization History</h2>

        <p>
          No optimizations yet.
        </p>
      </div>
    )
  }

  const totalSaved =
    history.reduce(
      (sum, item) =>
        sum + item.savedTokens,
      0
    )

  const avgSavings =
    (
      history.reduce(
        (sum, item) =>
          sum +
          item.savingsPercent,
        0
      ) / history.length
    ).toFixed(1)

  return (
    <div className="glass history-card">

      <h2>
        Optimization History
      </h2>

      <div className="history-stats">

        <div>
          <h3>{history.length}</h3>
          <p>Optimizations</p>
        </div>

        <div>
          <h3>{totalSaved}</h3>
          <p>Tokens Saved</p>
        </div>

        <div>
          <h3>{avgSavings}%</h3>
          <p>Average Savings</p>
        </div>

      </div>

      <div className="history-list">

        {history
          .slice()
          .reverse()
          .slice(0, 5)
          .map((item, index) => (
            <div
              key={index}
              className="history-item"
            >
              <span>
                {item.date}
              </span>

              <span>
                {item.savingsPercent}%
              </span>
            </div>
          ))}

      </div>

    </div>
  )
}