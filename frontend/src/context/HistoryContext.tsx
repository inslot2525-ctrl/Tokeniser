import { createContext, useContext, useState, useEffect } from "react";

export interface HistoryEntry {
  id: string;
  date: string;
  timestamp: string;
  // agent result fields
  route: string;
  model: string;
  prompt: string;
  optimized: string;
  originalPrompt: string;
  optimizedPrompt: string;
  savedTokens: number;
  savingsPercent: number;
  confidence?: number;
}

interface HistoryContextType {
  history: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id" | "date" | "timestamp">) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType>({
  history: [],
  addEntry: () => {},
  clearHistory: () => {},
});

const STORAGE_KEY = "tokenwise-history";

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addEntry = (entry: Omit<HistoryEntry, "id" | "date" | "timestamp">) => {
    const now = new Date();
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      date: now.toISOString(),
      timestamp: now.toLocaleTimeString(),
    };
    setHistory((prev) => [newEntry, ...prev]);
  };

  const clearHistory = () => setHistory([]);

  return (
    <HistoryContext.Provider value={{ history, addEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => useContext(HistoryContext);
