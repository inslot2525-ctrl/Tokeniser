import Hero from "../components/Dashboard/Hero";
import PromptBox from "../components/Dashboard/PromptBox";
import Pipeline from "../components/Dashboard/Pipeline";
import StatsCards from "../components/Dashboard/StatsCards";
import ResponsePanel from "../components/Dashboard/ResponsePanel";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      <Hero />

      <div className="mx-auto max-w-7xl px-8 pb-20">
        <PromptBox />

        <div className="mt-10">
          <Pipeline />
        </div>

        <div className="mt-10">
          <StatsCards />
        </div>

        <div className="mt-10">
          <ResponsePanel />
        </div>
      </div>
    </div>
  );
}
