import PromptBox from "./PromptBox";
import ResponsePanel from "./ResponsePanel";
import StatCard from "../Common/StatCard";

export default function Dashboard() {
  return (
    <main className="mx-auto max-w-7xl px-8 pb-24">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left */}
        <div className="space-y-6 lg:col-span-2">
          <PromptBox />
          <ResponsePanel />
        </div>

        {/* Right */}
        <div className="space-y-5">
          <StatCard title="Input Tokens" value="0" />
          <StatCard title="Saved Tokens" value="0" />
          <StatCard title="Confidence" value="--" />
          <StatCard title="Estimated Cost" value="$0.00" />
        </div>
      </div>
    </main>
  );
}
