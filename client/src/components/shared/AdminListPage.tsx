"use client";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 10;

interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
}

interface AdminListPageProps<T> {
  title: string;
  description?: string;
  queryKey: string[];
  queryFn: () => Promise<{ data?: T[] }>;
  columns: Column<T>[];
  onDelete?: (id: string) => void;
  idKey?: keyof T;
}

export function AdminListPage<T>({
  title, description, queryKey, queryFn, columns, onDelete, idKey = "id" as keyof T,
}: AdminListPageProps<T>) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey, queryFn });
  const allItems: T[] = (data as { data?: T[] })?.data ?? [];
  const totalPages = Math.ceil(allItems.length / PAGE_SIZE);
  const items = allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" />
        </div>
      ) : allItems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">No {title.toLowerCase()} found.</div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
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
                      <Button variant="ghost" size="icon" onClick={() => onDelete(String(item[idKey]))}>
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
