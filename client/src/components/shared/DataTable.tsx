import { ProgressBar } from "@/components/shared/ProgressBar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  /** render cell content; receives the row */
  render: (row: T) => React.ReactNode;
  /** if set, this column renders as a progress bar (row[key] is 0-100) */
  progress?: boolean;
  /** if set, this column renders as a status badge (row[key] is a string) */
  status?: boolean;
  /** status label mapping for badge cells */
  statusLabels?: Record<string, string>;
  /** status variant mapping for badge cells */
  statusVariants?: Record<string, BadgeVariant>;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyText?: string;
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
}

/**
 * Generic DataTable with optional progress-bar and status-badge columns,
 * matching the dashboard design system (rounded card, clean rows).
 */
export function DataTable<T>({
  columns,
  data,
  emptyText = "No data",
  getRowKey,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-canvas-soft">
          <BookOpen className="size-5 text-mute-text" />
        </div>
        <p className="text-sm text-mute-text">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[520px] text-left">
        <thead>
          <tr className="border-b border-canvas-soft text-xs font-bold uppercase tracking-wider text-mute-text">
            {columns.map((col) => (
              <th key={col.key} className={cn("pb-3 pr-3", col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={getRowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-b border-canvas-soft/60 last:border-0",
                onRowClick && "cursor-pointer transition-colors hover:bg-canvas-soft/40",
              )}
            >
              {columns.map((col) => {
                const value = (row as Record<string, unknown>)[col.key];
                if (col.progress && typeof value === "number") {
                  return (
                    <td key={col.key} className="w-40 py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={value} color="indigo" className="flex-1" />
                        <span className="text-xs font-bold text-ink">
                          {Math.round(value)}%
                        </span>
                      </div>
                    </td>
                  );
                }
                if (col.status && typeof value === "string") {
                  const label = col.statusLabels?.[value] ?? value;
                  const variant = col.statusVariants?.[value] ?? "secondary";
                  return (
                    <td key={col.key} className="py-3 pr-3">
                      <Badge variant={variant} className="rounded-full">
                        {label}
                      </Badge>
                    </td>
                  );
                }
                return (
                  <td key={col.key} className="py-3 pr-3">
                    {col.render(row)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
