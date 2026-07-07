import LandingPage from "./pages/LandingPage";
import { AgentProvider } from "./context/AgentContext";

export default function App() {
  return (
    <AgentProvider>
      <LandingPage />
    </AgentProvider>
  );
}