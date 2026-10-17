import React from "react";
import { AgentProvider } from "./AgentContext";
import { HistoryProvider } from "./HistoryContext";
import { SettingsProvider } from "./SettingsContext";
import { ThemeProvider } from "./ThemeContext";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <HistoryProvider>
          <AgentProvider>{children}</AgentProvider>
        </HistoryProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
