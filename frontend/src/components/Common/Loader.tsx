import { clsx } from "clsx";

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "h-4 w-4", md: "h-7 w-7", lg: "h-10 w-10" };

export default function Loader({ size = "md", className }: Props) {
  return (
    <div className={clsx("flex items-center justify-center", className)}>
      <div
        className={clsx(
          "animate-spin rounded-full border-2 border-white/15 border-t-orange-400",
          sizes[size]
        )}
      />
    </div>
  );
}
