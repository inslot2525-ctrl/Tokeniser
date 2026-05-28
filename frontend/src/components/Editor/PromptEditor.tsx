interface Props {
  value: string
  onChange: (value: string) => void
}

export default function PromptEditor({
  value,
  onChange,
}: Props) {
  return (
    <textarea
      className="prompt-editor glass"
      placeholder="Paste your prompt here..."
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
    />
  )
}