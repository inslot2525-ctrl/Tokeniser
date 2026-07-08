import type { ReactNode } from "react";
import { clsx } from "clsx";

interface Props {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  className?: string;
}

export default function StatCard({ title, value, icon, trend, className }: Props) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        {icon && <span className="text-orange-400">{icon}</span>}
      </div>
      <h2 className="mt-3 text-3xl font-bold text-white">{value}</h2>
      {trend && <p className="mt-1 text-xs text-gray-500">{trend}</p>}
    </div>
  );
}
