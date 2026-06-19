import { modelPricing } from "../../data/modelpricing";

interface Props {
  modelName: string;
  originalTokens: number;
  optimizedTokens: number;
}

export default function CostCalculator({
  modelName,
  originalTokens,
  optimizedTokens,
}: Props) {
  const pricing =
    modelPricing[
      modelName as keyof typeof modelPricing
    ];

  if (!pricing) return null;

  const costPerToken =
    pricing.inputCostPer1M /
    1_000_000;

  const originalCost =
    originalTokens *
    costPerToken;

  const optimizedCost =
    optimizedTokens *
    costPerToken;

  const saved =
    originalCost -
    optimizedCost;

  return (
    <div className="glass result-card">
      <h2>
        Cost Calculator
      </h2>

      <p>
        Model: {modelName}
      </p>

      <br />

      <p>
        Before Optimization:
        ${originalCost.toFixed(6)}
      </p>

      <p>
        After Optimization:
        ${optimizedCost.toFixed(6)}
      </p>

      <p>
        Money Saved:
        ${saved.toFixed(6)}
      </p>
    </div>
  );
}