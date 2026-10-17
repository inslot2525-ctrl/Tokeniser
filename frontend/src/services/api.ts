import axios from "axios";
import type {
  AgentResponse,
  CompressResponse,
  TokenResponse,
  EnhanceResponse,
  DashboardStats,
  Mode,
} from "../types/api";

export const API_URL: string = import.meta.env.VITE_API_URL ?? "";

const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    // Only needed when the backend sets API_KEY. A key shipped in a browser
    // bundle is not secret; rate limiting is what protects a public deploy.
    ...(import.meta.env.VITE_API_KEY && { "X-API-Key": import.meta.env.VITE_API_KEY }),
  },
});

/** Which mode to run in, and the user's own Gemini key for AI mode. */
export interface ModelOptions {
  mode: Mode;
  geminiKey?: string;
}

const FREE: ModelOptions = { mode: "free" };

function post<T>(path: string, prompt: string, opts: ModelOptions, signal?: AbortSignal) {
  // The key is sent only in AI mode, and only to this backend.
  const headers = opts.mode === "ai" && opts.geminiKey ? { "X-Gemini-Key": opts.geminiKey } : {};
  return http
    .post<T>(path, { prompt, mode: opts.mode }, { headers, signal })
    .then((r) => r.data);
}

export const runAgent = (prompt: string, opts: ModelOptions = FREE, signal?: AbortSignal) =>
  post<AgentResponse>("/agent", prompt, opts, signal);

// Compression is local and never calls a model, so it needs no mode or key.
export const compressPrompt = (prompt: string) =>
  post<CompressResponse>("/compress", prompt, FREE);

export const enhancePrompt = (prompt: string, opts: ModelOptions = FREE) =>
  post<EnhanceResponse>("/enhance", prompt, opts);

export const tokenizePrompt = (prompt: string) =>
  post<TokenResponse>("/tokenize", prompt, FREE);

export async function getDashboard(): Promise<DashboardStats> {
  const { data } = await http.get("/dashboard");
  return data;
}

/** The backend's error detail (e.g. "AI mode needs a Gemini API key…"), or a
 * fallback when the request never reached it. */
export function apiErrorMessage(err: unknown, fallback = "Unable to reach the backend. Is it running?") {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg); // 422 validation
    if (err.response?.status === 429) return "Rate limit reached. Try again in a minute.";
  }
  return fallback;
}

export default http;
