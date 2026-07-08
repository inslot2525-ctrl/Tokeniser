import type { ReactNode } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  variant?: Variant;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variants: Record<Variant, string> = {
  primary:
    "bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-40",
  secondary:
    "border border-white/20 text-white hover:bg-white/10 disabled:opacity-40",
  ghost:
    "text-gray-400 hover:text-white disabled:opacity-40",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className,
  type = "button",
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "rounded-xl px-5 py-2.5 text-sm font-semibold transition duration-200",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
