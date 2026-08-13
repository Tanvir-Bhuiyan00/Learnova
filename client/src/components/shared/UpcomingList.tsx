import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

export type UpcomingItemType = "assignment" | "test" | "lesson" | "event";

export interface UpcomingItem {
  id: string;
  type: UpcomingItemType;
  title: string;
  date: string; // ISO date
}

const tagStyles: Record<UpcomingItemType, string> = {
  assignment: "border-l-amber-400 bg-amber-50 text-amber-700",
  test: "border-l-pink-400 bg-pink-50 text-pink-700",
  lesson: "border-l-cyan-400 bg-cyan-50 text-cyan-700",
  event: "border-l-indigo-400 bg-indigo-50 text-indigo-700",
};

const tagLabels: Record<UpcomingItemType, string> = {
  assignment: "Assignment",
  test: "Test",
  lesson: "Lesson",
  event: "Event",
};

interface UpcomingListProps {
  items: UpcomingItem[];
  className?: string;
  emptyText?: string;
}

export function UpcomingList({
  items,
  className,
  emptyText = "Nothing scheduled",
}: UpcomingListProps) {
  const sorted = [...items].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className={cn("rounded-2xl bg-card p-4 ring-1 ring-border", className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-ink">Upcoming</p>
        <span className="text-xs font-medium text-mute-text">{sorted.length} items</span>
      </div>

      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-mute-text">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {sorted.slice(0, 6).map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border-l-4 p-2.5 transition-colors hover:bg-canvas-soft/60"
              style={{ borderLeftWidth: 4 }}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  tagStyles[item.type],
                )}
              >
                {tagLabels[item.type].slice(0, 3).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {item.title}
                </p>
                <p className="text-xs text-mute-text">{tagLabels[item.type]}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-mute-text">
                <CalendarDays className="size-3.5" />
                {format(new Date(item.date), "MMM d")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
