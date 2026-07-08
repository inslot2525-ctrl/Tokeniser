import axios from "axios";
import type {
  AgentResponse,
  OptimizeResponse,
  TokenResponse,
  EnhanceResponse,
  DashboardStats,
} from "../types/api";

const http = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});

const body = (prompt: string) => ({ prompt });

export async function runAgent(prompt: string): Promise<AgentResponse> {
  const { data } = await http.post<AgentResponse>("/agent", body(prompt));
  return data;
}

export async function optimizePrompt(prompt: string): Promise<OptimizeResponse> {
  const { data } = await http.post<OptimizeResponse>("/optimize", body(prompt));
  return data;
}

export async function smartOptimize(prompt: string): Promise<OptimizeResponse> {
  const { data } = await http.post<OptimizeResponse>("/smart-optimize", body(prompt));
  return data;
}

export async function enhancePrompt(prompt: string): Promise<EnhanceResponse> {
  const { data } = await http.post<EnhanceResponse>("/enhance", body(prompt));
  return data;
}

export async function tokenizePrompt(prompt: string): Promise<TokenResponse> {
  const { data } = await http.post<TokenResponse>("/tokenize", body(prompt));
  return data;
}

export async function getDashboard(): Promise<DashboardStats> {
  const { data } = await http.get<DashboardStats>("/dashboard");
  return data;
}

export default http;
