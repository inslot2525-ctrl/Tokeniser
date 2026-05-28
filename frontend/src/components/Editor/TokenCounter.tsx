interface Props {
  tokens: number
}

export default function TokenCounter({
  tokens,
}: Props) {
  return (
    <div className="token-counter">
      {tokens} tokens
    </div>
  )
}