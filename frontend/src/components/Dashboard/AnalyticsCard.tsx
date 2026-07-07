import {
  Brain,
  Coins,
  Shield,
  Clock3,
  Server,
  TrendingUp,
} from "lucide-react";

import { motion } from "framer-motion";

import { useAgentContext } from "../../context/AgentContext";

function Card({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.03,
      }}
      transition={{
        duration: 0.2,
      }}
      className="rounded-3xl border border-white/10 bg-[#101010] p-6"
    >
      <div className="flex justify-between">

        <div>

          <div className="text-gray-400">

            {title}

          </div>

          <div
            className={`text-3xl font-bold mt-3 ${color}`}
          >
            {value}
          </div>

        </div>

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} bg-white/5`}
        >
          {icon}
        </div>

      </div>
    </motion.div>
  );
}

export default function AnalyticsCards() {

  const { result } = useAgentContext();

  if (!result) return null;

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      <Card

        title="Confidence"

        value={`${result.confidence}%`}

        icon={<Brain size={26}/>}

        color="text-orange-400"

      />

      <Card

        title="Model"

        value={result.model}

        icon={<Server size={26}/>}

        color="text-blue-400"

      />

      <Card

        title="Route"

        value={result.route}

        icon={<TrendingUp size={26}/>}

        color="text-green-400"

      />

      <Card

        title="Estimated Cost"

        value={result.estimated_remote_cost}

        icon={<Coins size={26}/>}

        color="text-yellow-400"

      />

      <Card

        title="Security"

        value="SAFE"

        icon={<Shield size={26}/>}

        color="text-emerald-400"

      />

      <Card

        title="Latency"

        value="<1 sec"

        icon={<Clock3 size={26}/>}

        color="text-pink-400"

      />

    </div>

  );

}