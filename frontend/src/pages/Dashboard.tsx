import Hero from "../components/Hero/Hero";
import Workspace from "../components/Dashboard/Workspace";
import OptimizationHistory from "../components/Dashboard/OptimizationHistory";

export default function Dashboard() {
  return (
    <>
      <Hero />

      <div id="workspace" className="mt-16 space-y-10">
        {/* Prompt → pipeline → response */}
        <Workspace />
        <OptimizationHistory />
      </div>
    </>
  );
}
