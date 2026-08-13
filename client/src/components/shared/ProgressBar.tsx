import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  barClassName?: string;
  color?: "orange" | "pink" | "green" | "indigo";
}

const colorMap = {
  orange: "bg-accent-orange",
  pink: "bg-pink-400",
  green: "bg-accent-cyan",
  indigo: "bg-indigo-500",
};

export function ProgressBar({
  value,
  className,
  barClassName,
  color = "indigo",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-canvas-soft",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          colorMap[color],
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
