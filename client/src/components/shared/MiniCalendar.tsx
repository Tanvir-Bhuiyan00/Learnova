"use client";

import { cn } from "@/lib/utils";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { useEffect, useState } from "react";
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
  // "Today" is timezone-dependent, so it can't be computed during SSR —
  // the server (UTC) and the browser (e.g. UTC+6) would render different
  // highlighted cells and React hydration would fail (error 418). Gate the
  // date-dependent render on a mounted flag so the server HTML and the
  // client's first paint always agree; the calendar fills in after mount.
  const [mounted, setMounted] = useState(false);

  // Sync the mount flag once after hydration so the date-dependent cells are
  // only rendered on the client — a legitimate post-mount state sync.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const today = mounted ? new Date() : null;
  const anchor = mounted
    ? startOfWeek(today as Date, { weekStartsOn: 1 })
    : null;

  const [shiftedAnchor, setShiftedAnchor] = useState<Date | null>(null);

  const displayAnchor = shiftedAnchor ?? anchor;

  const moveWeek = (dir: 1 | -1) => {
    if (displayAnchor) {
      setShiftedAnchor(addDays(displayAnchor, dir * 7));
    }
  };

  const days = displayAnchor
    ? Array.from({ length: 7 }, (_, i) => addDays(displayAnchor, i))
    : [];

  return (
    <div className={cn("rounded-2xl bg-card p-4 ring-1 ring-border", className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-ink">
          {displayAnchor ? format(displayAnchor, "MMMM yyyy") : ""}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => moveWeek(-1)}
            aria-label="Previous week"
            className="flex size-6 items-center justify-center rounded-full text-mute-text transition-colors hover:bg-canvas-soft hover:text-ink"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => moveWeek(1)}
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
          const isToday = today ? isSameDay(day, today) : false;
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
