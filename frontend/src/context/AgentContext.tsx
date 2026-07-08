import { createContext, useContext, useState } from "react";
import type { AgentResponse } from "../types/api";

export type AgentResult = AgentResponse;

interface AgentContextType {
  result: AgentResult | null;
  setResult: (result: AgentResult | null) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;
  prompt: string;
  setPrompt: (p: string) => void;
}

const AgentContext = createContext<AgentContextType>({
  result: null,
  setResult: () => {},
  isLoading: false,
  setIsLoading: () => {},
  error: null,
  setError: () => {},
  prompt: "",
  setPrompt: () => {},
});

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [result, setResult] = useState<AgentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  return (
    <AgentContext.Provider
      value={{ result, setResult, isLoading, setIsLoading, error, setError, prompt, setPrompt }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export const useAgent = () => useContext(AgentContext);
export const useAgentContext = () => useContext(AgentContext);
