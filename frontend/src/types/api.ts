export interface AgentRequest {
  prompt: string;
}

export interface AgentResponse {
  original_prompt: string;
  processed_prompt: string;
  planner_reason: string;
  steps: string[];

  category: string;
  difficulty: string;
  reasoning: string;

  route: string;
  model: string;

  confidence: number;

  estimated_remote_cost: string;

  response: string;
}

export interface TokenResponse {
  tokens: number;
}

export interface OptimizeResponse {
  original: string;
  optimized: string;

  original_tokens: number;
  optimized_tokens: number;

  saved_tokens: number;
  savings_percent: number;
}