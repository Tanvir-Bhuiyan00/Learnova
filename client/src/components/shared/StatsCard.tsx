"use client";

import { CountUp } from "@/components/shared/CountUp";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { createElement, useRef, type MouseEvent } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  iconName: string;
  description?: string;
  className?: string;
  /** index used to offset the staggered entrance */
  index?: number;
}

const iconGradients: Record<string, string> = {
  Users: "from-blue-500/20 to-blue-600/10 text-blue-600 dark:text-blue-400",
  GraduationCap: "from-green-500/20 to-green-600/10 text-green-600 dark:text-green-400",
  Presentation: "from-orange-500/20 to-orange-600/10 text-orange-600 dark:text-orange-400",
  BookOpen: "from-indigo-500/20 to-indigo-600/10 text-indigo-600 dark:text-indigo-400",
  ClipboardList: "from-cyan-500/20 to-cyan-600/10 text-cyan-600 dark:text-cyan-400",
  DollarSign: "from-emerald-500/20 to-emerald-600/10 text-emerald-600 dark:text-emerald-400",
  Star: "from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400",
  CheckCircle: "from-lime-500/20 to-lime-600/10 text-lime-600 dark:text-lime-400",
};

const isNumeric = (v: unknown): v is number =>
  typeof v === "number" || (typeof v === "string" && !isNaN(Number(v.replace(/[^\d.-]/g, ""))));

const formatValue = (value: string | number): string => {
  if (typeof value === "number") {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  return String(value);
};

const StatsCard = ({
  title,
  value,
  iconName,
  description,
  className,
  index = 0,
}: StatsCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 30 });
  const spotlightX = useTransform(mouseX, (v) => `${v}px`);
  const spotlightY = useTransform(mouseY, (v) => `${v}px`);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const gradient = iconGradients[iconName] ?? "from-primary-pale to-primary-pale text-ink-deep";
  const numeric = isNumeric(value);
  const num = typeof value === "number" ? value : Number(value.replace(/[^\d.-]/g, ""));

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 18, scale: 0.97 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.35, delay: index * 0.04, ease: "easeOut" },
        },
      }}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-card p-5 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-pale hover:ring-primary/40",
        className,
      )}
    >
      {/* Spotlight glow that follows the cursor */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(280px circle at var(--x) var(--y), var(--color-primary-pale), transparent 80%)`,
        }}
      />

      <div className="relative flex flex-row items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-body-text">{title}</p>
          <div className="font-heading text-3xl font-extrabold text-ink">
            {numeric ? <CountUp value={num} /> : value}
          </div>
          {description && (
            <p className="text-xs font-medium text-mute-text">{description}</p>
          )}
        </div>

        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ring-white/10 dark:ring-white/5",
            gradient,
          )}
        >
          {createElement(getIconComponent(iconName), { className: "size-5" })}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;