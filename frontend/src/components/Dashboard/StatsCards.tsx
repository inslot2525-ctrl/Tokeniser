interface StatItem {
  title: string;
  value: string;
}

interface Props {
  stats?: StatItem[];
}

const defaultStats: StatItem[] = [
  { title: "Tokens Saved", value: "0" },
  { title: "Prompts Optimized", value: "0" },
  { title: "Cost Saved", value: "$0.00" },
  { title: "Avg Compression", value: "0%" },
];

export default function StatsCards({ stats = defaultStats }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <p className="text-sm text-gray-400">{stat.title}</p>
          <h2 className="mt-3 text-3xl font-bold text-white">{stat.value}</h2>
        </div>
      ))}
    </div>
  );
}
