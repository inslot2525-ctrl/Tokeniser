import { useState, useEffect } from "react";

import Card from "../components/Common/Card";

import PromptEditor from "../components/Editor/PromptEditor";
import TokenCounter from "../components/Editor/TokenCounter";

import OptimizationResult from "../components/Optimizer/OptimizationResult";
import TokenHeatmap from "../components/TokenVisualiser/TokenHeatmap";

import BudgetPlanner from "../components/Dashboard/BudgetPlanner";
import OptimizationHistory from "../components/Dashboard/OptimizationHistory";

import ModelSelector from "../components/Layout/ModelSelector";
import ChatSimulator from "../components/Simulator/ChatSimulator";

import useTokenizer from "../hooks/useTokenizer";
import CostCalculator from "../components/Dashboard/CostCalculator";

import {
  optimizePrompt,
  enhancePrompt,
} from "../utils/optimizerApi";

import { models } from "../data/modelLimits";
import type { ModelName } from "../data/modelLimits";

export default function OptimizerPage() {
  const [prompt, setPrompt] = useState("");

  const [selectedModel, setSelectedModel] =
    useState<ModelName>("gpt-4o");

  const [result, setResult] =
    useState<any>(null);

  const [history, setHistory] =
    useState<any[]>([]);

  const {
    tokenCount,
    loading,
  } = useTokenizer(prompt);

  useEffect(() => {
    const savedHistory =
      localStorage.getItem(
        "tokeniser-history"
      );

    if (savedHistory) {
      setHistory(
        JSON.parse(savedHistory)
      );
    }
  }, []);

  async function handleOptimize() {
    try {
      const response =
        await optimizePrompt(prompt);

      setResult(response);

      const newEntry = {
        date:
          new Date().toLocaleDateString(),
        savedTokens:
          response.saved_tokens,
        savingsPercent:
          response.savings_percent,
      };

      const updatedHistory = [
        ...history,
        newEntry,
      ];

      setHistory(updatedHistory);

      localStorage.setItem(
        "tokeniser-history",
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error(error);
    }
  }

async function handleEnhance() {
  console.log("Enhance button clicked");

  try {
    const response =
      await enhancePrompt(prompt);

    console.log("API response:", response);

    setPrompt(response.enhanced);
  } catch (error) {
    console.error("Enhance failed:", error);
  }
}
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <TokenCounter
        tokens={
          loading ? 0 : tokenCount
        }
      />

      <Card>
        <h2>Prompt Optimizer</h2>

        <p
          style={{
            marginTop: "10px",
            color:
              "var(--text-secondary)",
          }}
        >
          Compress prompts to reduce token usage.
        </p>

        <div
          style={{
            marginTop: "20px",
          }}
        >
          <ModelSelector
            selectedModel={
              selectedModel
            }
            onChange={
              setSelectedModel
            }
          />
        </div>

        <PromptEditor
          value={prompt}
          onChange={setPrompt}
        />

        <TokenHeatmap text={prompt} />

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <button
            className="primary-button"
            onClick={handleOptimize}
          >
            Optimize Prompt
          </button>

          <button
            className="primary-button"
            onClick={handleEnhance}
          >
            Enhance Prompt
          </button>
        </div>
      </Card>

      {result && (
        <>
          <OptimizationResult
            result={result}
          />

          <BudgetPlanner
            originalTokens={
              result.original_tokens
            }
            optimizedTokens={
              result.optimized_tokens
            }
            budget={
              models[selectedModel]
                .contextWindow
            }
          />

          <CostCalculator
  modelName={selectedModel}
  originalTokens={
    result.original_tokens
  }
  optimizedTokens={
    result.optimized_tokens
  }
/>

          <ChatSimulator
            originalTokens={
              result.original_tokens
            }
            optimizedTokens={
              result.optimized_tokens
            }
            contextWindow={
              models[selectedModel]
                .contextWindow
            }
          />

          <OptimizationHistory
            history={history}
          />
        </>
      )}
    </div>
  );
}