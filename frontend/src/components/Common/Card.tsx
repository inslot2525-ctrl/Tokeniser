import type { ReactNode } from "react";
import { clsx } from "clsx";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: Props) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
