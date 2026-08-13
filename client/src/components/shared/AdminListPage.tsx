"use client";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Inbox, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api.types";
import { LucideIcon } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
}

interface RowAction<T> {
  icon: LucideIcon;
  label: string;
  onClick: (item: T) => void;
  variant?: "ghost" | "destructive";
  className?: string;
}

interface AdminListPageProps<T> {
  title: string;
  description?: string;
  queryKey: string[];
  queryFn: (
    page: number,
  ) => Promise<{ data?: T[]; meta?: PaginationMeta }>;
  columns: Column<T>[];
  onDelete?: (id: string) => void;
  idKey?: keyof T;
  /** Extra per-row action buttons (e.g. edit). Rendered before delete. */
  actions?: RowAction<T>[];
  /** Optional element rendered at the end of the page header (e.g. an Add button). */
  headerAction?: React.ReactNode;
}

export function AdminListPage<T>({
  title, description, queryKey, queryFn, columns, onDelete, idKey = "id" as keyof T,
  actions = [], headerAction,
}: AdminListPageProps<T>) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: [...queryKey, page],
    queryFn: () => queryFn(page),
  });
  const allItems: T[] = data?.data ?? [];
  const totalPages = Math.max(1, data?.meta?.totalPages ?? 1);
  const safePage = Math.min(page, totalPages);
  const items = allItems;
  const total = data?.meta?.total;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page > totalPages) {
      setPage(Math.max(1, totalPages));
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-mute-text">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          {total != null && !isLoading && (
            <span className="rounded-full bg-canvas-soft px-3 py-1.5 text-xs font-bold text-body-text">
              {total} total
            </span>
          )}
          {headerAction}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : allItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 rounded-3xl border border-dashed p-16 text-center"
        >
          <div className="flex size-16 items-center justify-center rounded-3xl bg-canvas-soft">
            <Inbox className="size-7 text-mute-text" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-ink">
              No {title.toLowerCase()} found
            </h3>
            <p className="mt-1 text-sm text-mute-text">
              {description ?? "Nothing here yet."}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="overflow-hidden rounded-3xl bg-card ring-1 ring-border"
        >
          <Table>
            <TableHeader className="[&_tr]:bg-canvas-soft/70">
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key} className="text-xs font-bold uppercase tracking-wider">
                    {col.label}
                  </TableHead>
                ))}
                {(actions.length > 0 || onDelete) && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <motion.tr
                  key={String(item[idKey] ?? i)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="border-b border-canvas-soft transition-colors hover:bg-canvas-soft/40"
                >
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.render(item)}</TableCell>
                  ))}
                  {(actions.length > 0 || onDelete) && (
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {actions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <Button
                              key={action.label}
                              variant={action.variant ?? "ghost"}
                              size="icon"
                              className={
                                action.className ??
                                "text-mute-text transition-colors hover:bg-canvas-soft hover:text-ink"
                              }
                              onClick={() => action.onClick(item)}
                              aria-label={action.label}
                            >
                              <Icon className="size-4" />
                            </Button>
                          );
                        })}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-mute-text transition-colors hover:bg-negative/10 hover:text-negative"
                            onClick={() => onDelete(String(item[idKey]))}
                            aria-label="Delete"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </motion.tr>
              ))}
            </TableBody>
          </Table>
          <div className="border-t border-canvas-soft px-4 py-3">
            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </motion.div>
      )}
    </div>
  );
}