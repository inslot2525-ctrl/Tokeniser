import React from "react";
import { AgentProvider } from "./AgentContext";
import { HistoryProvider } from "./HistoryContext";
import { SettingsProvider } from "./SettingsContext";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <HistoryProvider>
        <AgentProvider>{children}</AgentProvider>
      </HistoryProvider>
    </SettingsProvider>
  );
}
