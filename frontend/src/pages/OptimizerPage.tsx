import { useState } from 'react'

import Card from '../components/Common/Card'

import PromptEditor from '../components/Editor/PromptEditor'
import TokenCounter from '../components/Editor/TokenCounter'

import OptimizationResult from '../components/Optimizer/OptimizationResult'

import useTokenizer from '../hooks/useTokenizer'

import { optimizePrompt } from '../utils/optimizerApi'
import TokenHeatmap from '../components/TokenVisualiser/TokenHeatmap'

export default function OptimizerPage() {
  const [prompt, setPrompt] = useState('')

  const [result, setResult] =
    useState<any>(null)

  const {
    tokenCount,
    loading,
  } = useTokenizer(prompt)

  async function handleOptimize() {
    try {
      const response =
        await optimizePrompt(prompt)

      setResult(response)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <TokenCounter
        tokens={loading ? 0 : tokenCount}
      />

      <Card>
        <h2>Prompt Optimizer</h2>

        <p
          style={{
            marginTop: '10px',
            color: 'var(--text-secondary)',
          }}
        >
          Compress prompts to reduce token
          usage.
        </p>

        <PromptEditor
          value={prompt}
          onChange={setPrompt}
        />
        <TokenHeatmap text={prompt} />

        <button
          className="primary-button"
          style={{
            marginTop: '20px',
          }}
          onClick={handleOptimize}
        >
          Optimize Prompt
        </button>
      </Card>

      <OptimizationResult result={result} />
    </div>
  )
}