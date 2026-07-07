import Hero from "../components/Dashboard/Hero";
import PromptBox from "../components/Dashboard/PromptBox";
import Pipeline from "../components/Dashboard/Pipeline";
import StatsCards from "../components/Dashboard/StatsCards";
import ResponsePanel from "../components/Dashboard/ResponsePanel";
import BudgetPlanner from "../components/Dashboard/BudgetPlanner";
import CostCalculator from "../components/Dashboard/CostCalculator";
import OptimizationHistory from "../components/Dashboard/OptimizationHistory";

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

                <div className="grid gap-8 lg:grid-cols-2 mt-10">

                    <BudgetPlanner />

                    <CostCalculator />

                </div>

                <div className="mt-10">

                    <OptimizationHistory />

                </div>

            </div>

        </div>

    );

}