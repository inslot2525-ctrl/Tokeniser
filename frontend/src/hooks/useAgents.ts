import { useState } from "react";
import { runAgent } from "../services/api";
import type { AgentResponse } from "../types/api";

export default function useAgents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AgentResponse | null>(null);

  async function execute(prompt: string): Promise<AgentResponse | null> {
    try {
      setLoading(true);
      setError(null);
      const response = await runAgent(prompt);
      setData(response);
      return response;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Unable to contact the backend. Is it running?";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { execute, loading, error, data };
}
