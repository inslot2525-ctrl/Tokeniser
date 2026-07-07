import HeroSection from "../components/Hero/HeroSection";
import PromptBox from "../components/Dashboard/PromptBox";

export default function LandingPage() {
  return (
    <main className="bg-black text-white min-h-screen overflow-x-hidden">
      <HeroSection />

      {/* Why TokenWise */}
      <section className="max-w-7xl mx-auto px-8 py-28">
        <div className="text-center mb-20">
          <p className="text-orange-400 uppercase tracking-[0.3em] text-sm">
            Why TokenWise
          </p>

          <h2 className="text-5xl font-bold mt-4">
            Optimize prompts intelligently.
          </h2>

          <p className="text-gray-400 mt-6 max-w-3xl mx-auto text-lg">
            TokenWise is an AI routing engine that enhances prompts,
            compresses tokens, detects jailbreaks, estimates confidence,
            verifies responses and automatically chooses the best model.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:border-orange-400 transition">
            <div className="text-4xl mb-5">⚡</div>

            <h3 className="text-2xl font-semibold mb-4">
              Smart Optimization
            </h3>

            <p className="text-gray-400 leading-8">
              Grammar correction, token compression and semantic optimization
              without changing the meaning.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:border-orange-400 transition">
            <div className="text-4xl mb-5">🧠</div>

            <h3 className="text-2xl font-semibold mb-4">
              Intelligent Routing
            </h3>

            <p className="text-gray-400 leading-8">
              Automatically decides whether the query should execute on a local
              LLM or Gemini based on complexity and confidence.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:border-orange-400 transition">
            <div className="text-4xl mb-5">🛡️</div>

            <h3 className="text-2xl font-semibold mb-4">
              AI Safety
            </h3>

            <p className="text-gray-400 leading-8">
              Detects jailbreak attempts, prompt injection, malicious inputs
              and validates generated responses before returning them.
            </p>
          </div>

        </div>
      </section>

      {/* Pipeline */}
      <section className="bg-[#090909] py-28">
        <div className="max-w-7xl mx-auto px-8">

          <h2 className="text-5xl font-bold text-center mb-20">
            Agent Pipeline
          </h2>

          <div className="grid md:grid-cols-6 gap-6">

            {[
              "Input",
              "Planner",
              "Optimizer",
              "Router",
              "Verifier",
              "Response"
            ].map((item, index) => (

              <div
                key={index}
                className="rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-500/10 to-transparent p-6 text-center hover:scale-105 transition"
              >

                <div className="text-orange-400 text-3xl font-bold">
                  {index + 1}
                </div>

                <h3 className="mt-5 font-semibold">
                  {item}
                </h3>

              </div>

            ))}

          </div>

        </div>
      </section>

      {/* Metrics */}
      <section className="max-w-7xl mx-auto px-8 py-28">

        <h2 className="text-center text-5xl font-bold mb-20">
          Performance
        </h2>

        <div className="grid md:grid-cols-4 gap-8">

          <Metric
            value="60%"
            label="Average Token Savings"
          />

          <Metric
            value="<250ms"
            label="Local Routing"
          />

          <Metric
            value="95%"
            label="Confidence Accuracy"
          />

          <Metric
            value="2x"
            label="Lower API Cost"
          />

        </div>

      </section>

      {/* CTA */}
      <section className="pb-32">

        <div className="max-w-5xl mx-auto rounded-[40px] border border-orange-500/30 bg-gradient-to-r from-orange-500/20 via-red-500/10 to-violet-600/20 px-10 py-24 text-center">

          <h2 className="text-5xl font-bold">
            Start Optimizing Your Prompts
          </h2>

          <p className="text-gray-300 mt-6 max-w-2xl mx-auto">
            Experience AI prompt enhancement, intelligent routing and
            token optimization with a single click.
          </p>

          <button className="mt-10 px-10 py-4 rounded-full bg-white text-black font-semibold hover:scale-105 transition">
            Launch Dashboard
          </button>

        </div>

      </section>

    </main>
  );
}

function Metric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">

      <div className="text-5xl font-bold text-orange-400">
        {value}
      </div>

      <p className="mt-4 text-gray-400">
        {label}
      </p>

    </div>
  );
}