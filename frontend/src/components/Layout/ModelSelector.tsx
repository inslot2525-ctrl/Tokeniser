import { models } from "../../data/modelLimits"
import type { ModelName } from "../../data/modelLimits"

interface Props {
  selectedModel: ModelName
  onChange: (model: ModelName) => void
}

export default function ModelSelector({
  selectedModel,
  onChange,
}: Props) {
  return (
    <div className="glass model-selector">
      <label>AI Model</label>

      <select
        value={selectedModel}
        onChange={(e) =>
          onChange(e.target.value as ModelName)
        }
      >
        {Object.keys(models).map((model) => (
          <option
            key={model}
            value={model}
          >
            {model}
          </option>
        ))}
      </select>
    </div>
  )
}