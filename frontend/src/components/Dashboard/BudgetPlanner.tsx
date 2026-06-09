interface Props {
  originalTokens: number
  optimizedTokens: number
  budget: number
}

export default function BudgetPlanner({
  originalTokens,
  optimizedTokens,
  budget,
}: Props) {
  const originalMessages =
    originalTokens > 0
      ? Math.floor(
          budget / originalTokens
        )
      : 0

  const optimizedMessages =
    optimizedTokens > 0
      ? Math.floor(
          budget / optimizedTokens
        )
      : 0

  const extraMessages =
    optimizedMessages -
    originalMessages

  const growth =
    originalMessages > 0
      ? (
          (extraMessages /
            originalMessages) *
          100
        ).toFixed(1)
      : "0"

  return (
    <div className="glass planner-card">
      <h2>Token Budget Planner</h2>

      <div className="planner-grid">
        <div className="planner-metric">
          <h3>{budget.toLocaleString()}</h3>
          <p>Model Context Window</p>
        </div>

        <div className="planner-metric">
          <h3>{originalMessages}</h3>
          <p>
            Messages Without
            Optimization
          </p>
        </div>

        <div className="planner-metric">
          <h3>{optimizedMessages}</h3>
          <p>
            Messages With
            Optimization
          </p>
        </div>

        <div className="planner-metric">
          <h3>+{extraMessages}</h3>
          <p>Extra Messages</p>
        </div>

        <div className="planner-metric">
          <h3>+{growth}%</h3>
          <p>
            Conversation Growth
          </p>
        </div>
      </div>
    </div>
  )
}