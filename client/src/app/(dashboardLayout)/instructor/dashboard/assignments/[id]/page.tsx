"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAssignmentById, deleteAssignment } from "@/services/assignment.services";
import { IAssignment } from "@/types/assignment.types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  params: Promise<{ id: string }>;
}

const AssignmentDetailPage = ({ params }: Props) => {
  const router = useRouter();
  const [id, setId] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => getAssignmentById(id),
    enabled: !!id,
  });

  const assignment: IAssignment | null = data?.data ?? null;

  const handleDelete = async () => {
    if (!assignment) return;
    if (!window.confirm(`Delete "${assignment.title}"? This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      await deleteAssignment(id);
      toast.success("Assignment deleted");
      router.push("/instructor/dashboard/assignments");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete assignment",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/instructor/dashboard/assignments"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-body-text transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to assignments
      </Link>

      {isLoading ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : !assignment ? (
        <div className="rounded-3xl border border-dashed p-12 text-center text-mute-text">
          Assignment not found
        </div>
      ) : (
        <Card className="overflow-hidden ring-1 ring-border">
          <div className="flex flex-col gap-6 p-8 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-primary-pale">
                <ClipboardList className="size-7 text-ink-deep" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-extrabold tracking-tight text-ink md:text-3xl">
                  {assignment.title}
                </h1>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-mute-text">
                  {assignment.dueDate && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      Due {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 font-semibold text-ink">
                    <Users className="size-4 text-mute-text" />
                    {assignment.totalMarks} pts
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <Link
                href={`/instructor/dashboard/assignments/${id}/edit`}
                className="shrink-0"
              >
                <Button variant="outline" className="gap-2 rounded-full">
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                className="gap-2 rounded-full text-negative hover:text-negative"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete
              </Button>
              <Link
                href={`/instructor/dashboard/assignments/${id}/submissions`}
                className="shrink-0"
              >
                <Button className="gap-2 rounded-full">
                  <FileText className="size-4" />
                  View submissions
                </Button>
              </Link>
            </div>
          </div>

          <CardContent className="border-t border-canvas-soft p-8 pt-6">
            <h2 className="font-heading text-lg font-bold text-ink">
              Instructions
            </h2>
            <p className="mt-3 leading-relaxed text-body-text">
              {assignment.instructions ||
                assignment.description ||
                "No instructions provided for this assignment."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignmentDetailPage;
