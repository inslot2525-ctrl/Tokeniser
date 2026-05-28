interface Props {
  result: any
}

export default function OptimizationResult({ result }: Props) {
  if (!result) {
    return null
  }

  return (
    <div className="glass card">
      <h3>Optimization Result</h3>
      <pre style={{ marginTop: '12px', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  )
}
