import axios from "axios";
import type {
  AgentResponse,
  OptimizeResponse,
  TokenResponse,
  EnhanceResponse,
  DashboardStats,
} from "../types/api";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    // Only needed when the backend sets API_KEY. A key shipped in a browser
    // bundle is not secret; rate limiting is what protects a public deploy.
    ...(import.meta.env.VITE_API_KEY && { "X-API-Key": import.meta.env.VITE_API_KEY }),
  },
});
const body = (prompt: string) => ({ prompt });

export async function runAgent(prompt: string): Promise<AgentResponse> {
  const { data } = await http.post("/agent", body(prompt));
  return data;
}

export async function optimizePrompt(prompt: string): Promise<OptimizeResponse> {
  const { data } = await http.post("/optimize", body(prompt));
  return data;
}

export async function smartOptimize(prompt: string): Promise<OptimizeResponse> {
  const { data } = await http.post("/smart-optimize", body(prompt));
  return data;
}

export async function enhancePrompt(prompt: string): Promise<EnhanceResponse> {
  const { data } = await http.post("/enhance", body(prompt));
  return data;
}

export async function tokenizePrompt(prompt: string): Promise<TokenResponse> {
  const { data } = await http.post("/tokenize", body(prompt));
  return data;
}

export async function getDashboard(): Promise<DashboardStats> {
  const { data } = await http.get("/dashboard");
  return data;
}

export default http;