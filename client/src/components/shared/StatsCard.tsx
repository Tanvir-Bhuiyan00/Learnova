"use client";

import { CircularProgress } from "@/components/shared/CircularProgress";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { createElement } from "react";

export type StatAccent = "orange" | "pink" | "green" | "indigo";

interface StatCardProps {
  title: string;
  value: string | number;
  iconName: string;
  description?: string;
  /** progress ring value 0-100 (shown on the right) */
  progress?: number;
  accent?: StatAccent;
  className?: string;
  index?: number;
}

const accentConfig: Record<
  StatAccent,
  { chip: string; ring: StatAccent; sub: string }
> = {
  orange: {
    chip: "bg-[#fff1e6] text-[#c2640a]",
    ring: "orange",
    sub: "text-[#c2640a]",
  },
  pink: {
    chip: "bg-[#fdeaf3] text-[#c2416b]",
    ring: "pink",
    sub: "text-[#c2416b]",
  },
  green: {
    chip: "bg-[#e6f9f0] text-[#0a7d4a]",
    ring: "green",
    sub: "text-[#0a7d4a]",
  },
  indigo: {
    chip: "bg-indigo-50 text-indigo-600",
    ring: "indigo",
    sub: "text-indigo-600",
  },
};

export const StatsCard = ({
  title,
  value,
  iconName,
  description,
  progress,
  accent = "indigo",
  className,
  index = 0,
}: StatCardProps) => {
  const cfg = accentConfig[accent];
  const Icon = getIconComponent(iconName);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, delay: index * 0.05, ease: "easeOut" },
        },
      }}
      className={cn(
        "rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "mb-3 flex size-10 shrink-0 items-center justify-center rounded-xl",
              cfg.chip,
            )}
          >
            {createElement(Icon, { className: "size-5" })}
          </div>
          <p className="text-sm font-medium text-mute-text">{title}</p>
          <p className="mt-0.5 font-heading text-3xl font-extrabold text-ink">
            {value}
          </p>
          {description && (
            <p className={cn("mt-1 text-xs font-semibold", cfg.sub)}>
              {description}
            </p>
          )}
        </div>

        {progress !== undefined && (
          <CircularProgress
            value={progress}
            size={54}
            strokeWidth={5}
            color={accent === "indigo" ? "indigo" : accent}
            label={`${Math.round(progress)}%`}
          />
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;