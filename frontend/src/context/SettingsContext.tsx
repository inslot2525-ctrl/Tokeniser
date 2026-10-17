import { createContext, useContext, useState } from "react";
import type { Mode } from "../types/api";

// The Gemini key is kept in sessionStorage (cleared when the tab closes)
// unless the user opts in to remembering it in localStorage. It is only ever
// sent to this app's backend, in the X-Gemini-Key header.
const MODE_KEY = "tokenwise.mode";
const GEMINI_KEY = "tokenwise.geminiKey";
const REMEMBER_KEY = "tokenwise.rememberKey";

function read(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null; // storage can be blocked (private mode, strict settings)
  }
}

function write(storage: () => Storage, key: string, value: string | null) {
  try {
    if (value === null) storage().removeItem(key);
    else storage().setItem(key, value);
  } catch {
    // Not fatal: the setting just won't persist.
  }
}

const local = () => window.localStorage;
const session = () => window.sessionStorage;

interface SettingsContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  geminiKey: string;
  rememberKey: boolean;
  saveGeminiKey: (key: string, remember: boolean) => void;
  clearGeminiKey: () => void;
}

const SettingsContext = createContext<SettingsContextType>({
  mode: "free",
  setMode: () => {},
  geminiKey: "",
  rememberKey: false,
  saveGeminiKey: () => {},
  clearGeminiKey: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>(
    read(local, MODE_KEY) === "ai" ? "ai" : "free"
  );
  const [rememberKey, setRememberKey] = useState(read(local, REMEMBER_KEY) === "1");
  const [geminiKey, setGeminiKey] = useState(
    read(session, GEMINI_KEY) ?? read(local, GEMINI_KEY) ?? ""
  );

  function setMode(next: Mode) {
    setModeState(next);
    write(local, MODE_KEY, next);
  }

  function saveGeminiKey(key: string, remember: boolean) {
    const trimmed = key.trim();
    setGeminiKey(trimmed);
    setRememberKey(remember);
    write(local, REMEMBER_KEY, remember ? "1" : null);
    write(session, GEMINI_KEY, trimmed || null);
    write(local, GEMINI_KEY, remember && trimmed ? trimmed : null);
  }

  function clearGeminiKey() {
    saveGeminiKey("", false);
  }

  return (
    <SettingsContext.Provider
      value={{ mode, setMode, geminiKey, rememberKey, saveGeminiKey, clearGeminiKey }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
