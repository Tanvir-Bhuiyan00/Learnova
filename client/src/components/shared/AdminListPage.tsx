"use client";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PaginationMeta } from "@/types/api.types";

interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
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
}

export function AdminListPage<T>({
  title, description, queryKey, queryFn, columns, onDelete, idKey = "id" as keyof T,
}: AdminListPageProps<T>) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: [...queryKey, page],
    queryFn: () => queryFn(page),
  });
  const allItems: T[] = data?.data ?? [];
  const totalPages = Math.max(1, data?.meta?.totalPages ?? 1);
  const safePage = Math.min(page, totalPages);
  // Items come pre-paginated from the server; the client only tracks the page.
  const items = allItems;

  // If the current page is beyond the last page (e.g. rows were deleted),
  // snap back to the last valid page so the table refetches instead of
  // showing an empty "no items" state for a page that no longer exists.
  useEffect(() => {
    if (page > totalPages) {
      setPage(Math.max(1, totalPages));
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-mute-text">{description}</p>}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" />
        </div>
      ) : allItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-12 text-center text-mute-text">
          No {title.toLowerCase()} found.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">
          <Table>
            <TableHeader className="[&_tr]:bg-canvas-soft/70">
              <TableRow>
                {columns.map((col) => <TableHead key={col.key}>{col.label}</TableHead>)}
                {onDelete && <TableHead className="w-16">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={String(item[idKey] ?? i)}>
                  {columns.map((col) => <TableCell key={col.key}>{col.render(item)}</TableCell>)}
                  {onDelete && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-mute-text hover:bg-negative/10 hover:text-negative"
                        onClick={() => onDelete(String(item[idKey]))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="border-t border-canvas-soft px-4 py-3">
            <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
