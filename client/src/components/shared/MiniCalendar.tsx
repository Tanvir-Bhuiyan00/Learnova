"use client";

import { cn } from "@/lib/utils";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MiniCalendarProps {
  highlightedDates?: Date[];
  className?: string;
}

export function MiniCalendar({
  highlightedDates = [],
  className,
}: MiniCalendarProps) {
  const [today] = useState(() => new Date());
  const [anchor, setAnchor] = useState(() => startOfWeek(today, { weekStartsOn: 1 }));

  const days = Array.from({ length: 7 }, (_, i) => addDays(anchor, i));

  const shift = (dir: 1 | -1) =>
    setAnchor((a) => addDays(a, dir * 7));

  return (
    <div className={cn("rounded-2xl bg-card p-4 ring-1 ring-border", className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-ink">{format(anchor, "MMMM yyyy")}</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => shift(-1)}
            aria-label="Previous week"
            className="flex size-6 items-center justify-center rounded-full text-mute-text transition-colors hover:bg-canvas-soft hover:text-ink"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => shift(1)}
            aria-label="Next week"
            className="flex size-6 items-center justify-center rounded-full text-mute-text transition-colors hover:bg-canvas-soft hover:text-ink"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-[0.625rem] font-bold uppercase text-mute-text">
            {d}
          </span>
        ))}
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const isHighlighted = highlightedDates.some((h) => isSameDay(h, day));
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                isToday
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : isHighlighted
                    ? "bg-primary-pale text-ink-deep"
                    : "text-body-text hover:bg-canvas-soft",
              )}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
}
