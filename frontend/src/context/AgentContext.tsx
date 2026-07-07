import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import { AgentResponse } from "../types/api";

interface AgentContextType {
  result: AgentResponse | null;
  setResult: (value: AgentResponse | null) => void;
}

const AgentContext =
  createContext<AgentContextType | undefined>(
    undefined
  );

export function AgentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [result, setResult] =
    useState<AgentResponse | null>(null);

  return (
    <AgentContext.Provider
      value={{
        result,
        setResult,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentContext() {
  const context =
    useContext(AgentContext);

  if (!context) {
    throw new Error(
      "useAgentContext must be used inside AgentProvider"
    );
  }

  return context;
}