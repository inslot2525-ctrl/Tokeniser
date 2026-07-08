// ─── Request ────────────────────────────────────────────────────────────────
export interface PromptRequest {
  prompt: string;
}

// ─── /agent response ─────────────────────────────────────────────────────────
export interface AgentRequest {
  prompt: string;
}

export interface AgentResponse {
  original_prompt: string;
  processed_prompt: string;
  planner_reason: string;
  steps: string[];
  route: string;
  model: string;
  confidence: number;
  estimated_remote_cost: string;
  response: string;
  verification?: Record<string, unknown>;
}

// ─── /optimize & /smart-optimize response ───────────────────────────────────
export interface OptimizeResponse {
  original: string;
  optimized: string;
  original_tokens: number;
  optimized_tokens: number;
  saved_tokens: number;
  savings_percent: number;
}

// ─── /tokenize response ─────────────────────────────────────────────────────
export interface TokenResponse {
  tokens: number;
}

// ─── /enhance response ──────────────────────────────────────────────────────
export interface EnhanceResponse {
  enhanced: string;
}

// ─── /compress response ─────────────────────────────────────────────────────
export interface CompressResponse {
  compressed: string;
}

// ─── /detect-risk response ───────────────────────────────────────────────────
export interface RiskResponse {
  risk_level: string;
  reason: string;
}

// ─── /dashboard response ─────────────────────────────────────────────────────
export interface DashboardStats {
  total_requests: number;
  total_tokens_saved: number;
  avg_savings_percent: number;
  route_distribution: Record<string, number>;
}
