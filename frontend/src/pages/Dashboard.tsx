import Hero from "../components/Hero/Hero";
import Workspace from "../components/Dashboard/Workspace";
import OptimizationHistory from "../components/Dashboard/OptimizationHistory";
import AnalyticsCards from "../components/Dashboard/AnalyticsCard";
import ExecutionTimeline from "../components/Dashboard/ExecutionTimeline";
import TokenAnalytics from "../components/Dashboard/Token_analytics";

export default function Dashboard() {
  return (
    <>
      <Hero />

      <div className="mt-16 space-y-10">
        {/* Main workspace: prompt → pipeline → response */}
        <Workspace />

        {/* Only shown after a result exists */}
        <AnalyticsCards />
        <div className="grid gap-8 lg:grid-cols-2">
          <ExecutionTimeline />
          <OptimizationHistory />
        </div>
        <TokenAnalytics />
      </div>
    </>
  );
}
