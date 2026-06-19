interface DiffViewerProps {
  original: string
  optimized: string
}

export default function DiffViewer({
  original,
  optimized,
}: DiffViewerProps) {
  const originalLines =
    original.split("\n")

  const optimizedLines =
    optimized.split("\n")

  return (
    <div className="glass diff-viewer">
      <h3>Changes Made</h3>

      <div className="diff-container">
        <div className="diff-column">
          <h4>Removed / Original</h4>

          {originalLines.map(
            (line, index) => (
              <div
                key={index}
                className="diff-removed"
              >
                - {line}
              </div>
            )
          )}
        </div>

        <div className="diff-column">
          <h4>Optimized</h4>

          {optimizedLines.map(
            (line, index) => (
              <div
                key={index}
                className="diff-added"
              >
                + {line}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}