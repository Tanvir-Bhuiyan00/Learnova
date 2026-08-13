import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** color of the progress ring */
  color?: "orange" | "pink" | "green" | "indigo";
  /** optional label shown in the center */
  label?: string;
}

const ringColorMap = {
  orange: "#ffc091",
  pink: "#f9a8d4",
  green: "#38c8ff",
  indigo: "#6366f1",
};

export function CircularProgress({
  value,
  size = 52,
  strokeWidth = 5,
  className,
  color = "indigo",
  label,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--canvas-soft)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColorMap[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {label !== undefined && (
        <span className="absolute text-xs font-bold text-ink">{label}</span>
      )}
    </div>
  );
}
