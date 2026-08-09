"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <AlertTriangle className="mb-4 size-12 text-destructive" />
          <CardTitle className="mb-2">Something went wrong</CardTitle>
          <p className="mb-6 text-sm text-muted-foreground">{error.message || "An unexpected error occurred"}</p>
          <Button onClick={() => reset()}>Try Again</Button>
        </CardContent>
      </Card>
    </div>
  );
}
