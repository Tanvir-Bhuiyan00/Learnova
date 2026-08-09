"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  const delta = 2;
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);
  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <Button variant="outline" size="icon" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
        <ChevronLeft className="size-4" />
      </Button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">...</span>
        ) : (
          <Button key={p} variant={p === currentPage ? "default" : "outline"} size="icon" onClick={() => onPageChange(p)}>
            {p}
          </Button>
        )
      )}
      <Button variant="outline" size="icon" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
