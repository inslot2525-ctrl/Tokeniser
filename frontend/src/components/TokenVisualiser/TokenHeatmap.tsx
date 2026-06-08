interface Props {
  text: string
}

export default function TokenHeatmap({
  text,
}: Props) {
  if (!text.trim()) return null

  const words = text.split(/\s+/)

  function getHeatClass(
    word: string
  ) {
    const len = word.length

    if (len <= 4)
      return "heat-low"

    if (len <= 8)
      return "heat-medium"

    return "heat-high"
  }

  return (
    <div className="heatmap-container">
      <h3>Token Heatmap</h3>

      <div className="heatmap-words">
        {words.map((word, index) => (
          <span
            key={index}
            className={`heat-word ${getHeatClass(
              word
            )}`}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}