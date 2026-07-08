import Hero from "../components/Hero/Hero";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <Hero />

      {/* Why TokenWise */}
      <section className="mx-auto max-w-7xl px-8 py-28">
        <div className="mb-20 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
            Why TokenWise
          </p>
          <h2 className="mt-4 text-5xl font-bold">
            Optimize prompts intelligently.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-400">
            TokenWise is an AI routing engine that enhances prompts,
            compresses tokens, detects jailbreaks, estimates confidence,
            verifies responses and automatically chooses the best model.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: "⚡",
              title: "Smart Optimization",
              desc: "Grammar correction, token compression and semantic optimization without changing the meaning.",
            },
            {
              icon: "🧠",
              title: "Intelligent Routing",
              desc: "Automatically decides whether the query should execute on a local LLM or Gemini based on complexity and confidence.",
            },
            {
              icon: "🛡️",
              title: "AI Safety",
              desc: "Detects jailbreak attempts, prompt injection, malicious inputs and validates generated responses before returning them.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:border-orange-400"
            >
              <div className="mb-5 text-4xl">{card.icon}</div>
              <h3 className="mb-4 text-2xl font-semibold">{card.title}</h3>
              <p className="leading-8 text-gray-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section className="bg-[#090909] py-28">
        <div className="mx-auto max-w-7xl px-8">
          <h2 className="mb-20 text-center text-5xl font-bold">Agent Pipeline</h2>
          <div className="grid gap-6 md:grid-cols-6">
            {["Input", "Planner", "Optimizer", "Router", "Verifier", "Response"].map(
              (item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-500/10 to-transparent p-6 text-center transition hover:scale-105"
                >
                  <div className="text-3xl font-bold text-orange-400">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 font-semibold">{item}</h3>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="mx-auto max-w-7xl px-8 py-28">
        <h2 className="mb-20 text-center text-5xl font-bold">Performance</h2>
        <div className="grid gap-8 md:grid-cols-4">
          {[
            { value: "60%", label: "Average Token Savings" },
            { value: "<250ms", label: "Local Routing" },
            { value: "95%", label: "Confidence Accuracy" },
            { value: "2x", label: "Lower API Cost" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center"
            >
              <div className="text-5xl font-bold text-orange-400">{m.value}</div>
              <p className="mt-4 text-gray-400">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-32">
        <div className="mx-auto max-w-5xl rounded-[40px] border border-orange-500/30 bg-gradient-to-r from-orange-500/20 via-red-500/10 to-violet-600/20 px-10 py-24 text-center">
          <h2 className="text-5xl font-bold">Start Optimizing Your Prompts</h2>
          <p className="mx-auto mt-6 max-w-2xl text-gray-300">
            Experience AI prompt enhancement, intelligent routing and token
            optimization with a single click.
          </p>
          <button className="mt-10 rounded-full bg-white px-10 py-4 font-semibold text-black transition hover:scale-105">
            Launch Dashboard
          </button>
        </div>
      </section>
    </main>
  );
}
