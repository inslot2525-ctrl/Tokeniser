// Mirrors the FastAPI responses in backend/app/api/routes.py.

// ─── Request ────────────────────────────────────────────────────────────────
export interface PromptRequest {
  prompt: string;
}

// ─── /detect-risk response ───────────────────────────────────────────────────
export interface RiskResponse {
  risk: "LOW" | "MEDIUM" | "HIGH";
  attack_type: string;
  confidence: number;
  matched_patterns: string[];
}

// ─── /agent response ─────────────────────────────────────────────────────────
export interface TokenAccounting {
  original: number;
  optimized: number;
  saved: number;
  /** Tokens spent by the pipeline's own rewrite and verifier calls. */
  pipeline_overhead: number;
  /** saved - pipeline_overhead; negative when the pipeline cost more than it saved. */
  net_saved: number;
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
  verification: { score: number; reason: string } | null;
  risk: RiskResponse;
  analysis: {
    category: string;
    difficulty: string;
    reasoning: string;
    signals: string[];
  } | null;
  tokens: TokenAccounting;
}

// ─── /optimize, /smart-optimize, /compress, /enhance response ───────────────
export interface OptimizeResponse {
  original: string;
  optimized: string;
  original_tokens: number;
  optimized_tokens: number;
  saved_tokens: number;
  savings_percent: number;
  overhead_tokens: number;
  backend: string;
}

export interface EnhanceResponse extends OptimizeResponse {
  enhanced: string;
}

export interface CompressResponse extends OptimizeResponse {
  compressed: string;
}

// ─── /tokenize response ─────────────────────────────────────────────────────
export interface TokenResponse {
  tokens: number;
}

// ─── /dashboard response ─────────────────────────────────────────────────────
export interface DashboardStats {
  total_requests: number;
  total_tokens_saved: number;
  pipeline_overhead_tokens: number;
  net_tokens_saved: number;
  avg_savings_percent: number;
  route_distribution: Record<string, number>;
  local_percentage: number;
  estimated_remote_cost: number;
  average_verification: number | null;
}
