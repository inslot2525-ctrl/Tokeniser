import PromptBox from "./PromptBox";
import ResponsePanel from "./ResponsePanel";
import StatsCard from "./StatsCard";
import Pipeline from "./Pipeline";

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

          <StatsCard
            title="Input Tokens"
            value="0"
          />

          <StatsCard
            title="Saved Tokens"
            value="0"
          />

          <StatsCard
            title="Confidence"
            value="--"
          />

          <StatsCard
            title="Estimated Cost"
            value="$0.00"
          />

        </div>

      </div>

    </main>
  );
}