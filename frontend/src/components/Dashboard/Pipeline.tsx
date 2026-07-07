const steps = [
  { label: "Enhance", icon: "✨", description: "Grammar & clarity improvements" },
  { label: "Compress", icon: "⚡", description: "Token reduction" },
  { label: "Security", icon: "🛡️", description: "Jailbreak detection" },
  { label: "Route", icon: "🔀", description: "Model selection" },
  { label: "Verify", icon: "✅", description: "Response validation" },
];

interface Props {
  activeStep?: number;
}

export default function Pipeline({ activeStep = -1 }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h3 className="mb-6 text-lg font-semibold text-white">Optimization Pipeline</h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className={`flex min-w-[100px] flex-col items-center rounded-xl border p-3 text-center transition ${
                i === activeStep
                  ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
                  : "border-white/10 bg-white/5 text-gray-400"
              }`}
            >
              <span className="text-xl">{step.icon}</span>
              <span className="mt-1 text-xs font-semibold">{step.label}</span>
              <span className="mt-1 text-xs opacity-70">{step.description}</span>
            </div>
            {i < steps.length - 1 && (
              <span className="text-gray-600">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
