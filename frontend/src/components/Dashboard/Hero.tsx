import AnimatedButton from "../Layout/AnimatedButton";

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-24 pb-20 text-center">
      {/* Badge */}
      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm font-medium text-cyan-300 backdrop-blur-md">
        AI Prompt Engineering Platform
      </span>

      {/* Heading */}
      <h1 className="mt-8 text-5xl font-black leading-tight text-white md:text-6xl lg:text-7xl">
        Optimize.
        <br />
        Route.
        <br />
        Secure.
      </h1>

      {/* Description */}
      <p className="mt-8 max-w-3xl text-lg leading-8 text-gray-400">
        TokenWise intelligently enhances prompts, compresses tokens,
        detects jailbreak attacks, routes requests to the optimal LLM,
        verifies responses, and estimates inference cost before execution.
      </p>

      {/* CTA */}
      <div className="mt-12">
        <a href="#dashboard">
          <AnimatedButton text="Start Optimizing" />
        </a>
      </div>

      {/* Feature Cards */}
      <div className="mt-20 grid w-full gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:border-cyan-400/30 hover:bg-white/10">
          <h3 className="text-lg font-semibold text-white">Prompt Optimization</h3>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            Automatically enhance grammar, compress prompts, reduce token usage, and improve LLM performance.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:border-cyan-400/30 hover:bg-white/10">
          <h3 className="text-lg font-semibold text-white">Intelligent Routing</h3>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            Analyze prompt complexity and route requests to the most efficient local or cloud model.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:border-cyan-400/30 hover:bg-white/10">
          <h3 className="text-lg font-semibold text-white">AI Verification</h3>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            Evaluate every response for quality, confidence, correctness, and relevance before returning results.
          </p>
        </div>
      </div>
    </section>
  );
}
