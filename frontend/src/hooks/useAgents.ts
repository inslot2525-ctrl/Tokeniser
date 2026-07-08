import { useState, useRef } from "react";
import axios from "axios";
import { runAgent } from "../services/api";
import type { AgentResponse } from "../types/api";

export default function useAgents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AgentResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  async function execute(prompt: string): Promise<AgentResponse | null> {
    try {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);
      const response = await runAgent(prompt);
      setData(response);
      return response;
    } catch (err: unknown) {
      if (axios.isCancel(err)) {
        setError("Request cancelled");
        return null;
      }
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Unable to contact the backend. Is it running?";
      setError(message);
      return null;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }

  function cancel() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }

  return { execute, cancel, loading, error, data };
}
