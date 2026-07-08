import React from "react";
import { AgentProvider } from "./AgentContext";
import { HistoryProvider } from "./HistoryContext";
import { ThemeProvider } from "./ThemeContext";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <HistoryProvider>
        <AgentProvider>{children}</AgentProvider>
      </HistoryProvider>
    </ThemeProvider>
  );
}
