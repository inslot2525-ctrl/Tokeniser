import { Link } from "react-router-dom";
import { ArrowRight, Shield, Zap, Brain } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Prompt Optimization",
    desc: "Compress tokens, fix grammar, and reduce API costs without changing meaning.",
  },
  {
    icon: Brain,
    title: "Intelligent Routing",
    desc: "Automatically route to local or cloud models based on complexity analysis.",
  },
  {
    icon: Shield,
    title: "AI Safety",
    desc: "Detect jailbreak attempts and validate responses before they reach users.",
  },
];

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-20 pb-16 text-center">
      {/* Badge */}
      <span className="rounded-full border border-orange-400/25 bg-orange-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-orange-400">
        AI Prompt Engineering Platform
      </span>

      {/* Heading */}
      <h1 className="mt-7 text-5xl font-black leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
        Optimize.{" "}
        <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          Route.
        </span>{" "}
        Secure.
      </h1>

      <p className="mt-6 max-w-2xl text-base leading-8 text-gray-400">
        TokenWise enhances prompts, compresses tokens, detects jailbreaks,
        routes to the optimal model, and verifies responses — all in one pipeline.
      </p>

      {/* CTA */}
      <div className="mt-10 flex items-center gap-4">
        <a
          href="#workspace"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
        >
          Start Optimizing
          <ArrowRight size={16} />
        </a>
        <Link
          to="/optimizer"
          className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
        >
          Try Optimizer
        </Link>
      </div>

      {/* Feature cards */}
      <div className="mt-20 grid w-full gap-5 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition duration-300 hover:border-orange-400/30 hover:bg-white/[0.06]"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15">
              <Icon size={20} className="text-orange-400" />
            </div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
