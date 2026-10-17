import { useState, useRef } from "react";
import axios from "axios";
import { apiErrorMessage, runAgent, type ModelOptions } from "../services/api";
import type { AgentResponse } from "../types/api";

export type AgentOutcome =
  | { response: AgentResponse; error: null; cancelled?: false }
  | { response: null; error: string; cancelled?: boolean };

export default function useAgents() {
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  async function execute(prompt: string, opts: ModelOptions): Promise<AgentOutcome> {
    abortControllerRef.current = new AbortController();
    setLoading(true);
    try {
      const response = await runAgent(prompt, opts, abortControllerRef.current.signal);
      return { response, error: null };
    } catch (err: unknown) {
      if (axios.isCancel(err)) return { response: null, error: "Request cancelled", cancelled: true };
      return { response: null, error: apiErrorMessage(err) };
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }

  function cancel() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }

  return { execute, cancel, loading };
}
