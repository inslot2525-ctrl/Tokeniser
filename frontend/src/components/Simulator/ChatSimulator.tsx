interface Props {
  originalTokens: number
  optimizedTokens: number
  contextWindow: number
}

export default function ChatSimulator({
  originalTokens,
  optimizedTokens,
  contextWindow,
}: Props) {
  const originalCapacity =
    Math.floor(
      contextWindow / originalTokens
    )

  const optimizedCapacity =
    Math.floor(
      contextWindow / optimizedTokens
    )

  const improvement =
    optimizedCapacity -
    originalCapacity

  const originalPercent =
    Math.min(
      (originalTokens /
        optimizedTokens) *
        100,
      100
    )

  const optimizedPercent = 55

  return (
    <div className="glass simulator-card">
      <h2>
        Conversation Simulator
      </h2>

      <div className="simulator-grid">

        <div className="chat-card">
          <h3>Original Prompt</h3>

          <div className="bar-bg">
            <div
              className="bar-fill danger"
              style={{
                width: `${originalPercent}%`,
              }}
            />
          </div>

          <p>
            Capacity:
            {" "}
            {originalCapacity.toLocaleString()}
          </p>

          <span className="danger-text">
            Context fills faster
          </span>
        </div>

        <div className="chat-card">
          <h3>Optimized Prompt</h3>

          <div className="bar-bg">
            <div
              className="bar-fill success"
              style={{
                width: `${optimizedPercent}%`,
              }}
            />
          </div>

          <p>
            Capacity:
            {" "}
            {optimizedCapacity.toLocaleString()}
          </p>

          <span className="success-text">
            More conversations possible
          </span>
        </div>

      </div>

      <div className="simulator-banner">
        🚀 +{improvement.toLocaleString()}
        {" "}
        additional prompt runs
      </div>
    </div>
  )
}