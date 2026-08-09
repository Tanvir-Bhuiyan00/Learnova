"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getSubmissions } from "@/services/assignment.services";
import { IAssignmentSubmission } from "@/types/assignment.types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ClipboardList, FileText, GraduationCap } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";
import { useEffect, useState } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

const AssignmentSubmissionsPage = ({ params }: Props) => {
  const [id, setId] = useState("");
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["assignment-submissions", id],
    queryFn: () => getSubmissions(id),
    enabled: !!id,
  });

  const submissions: IAssignmentSubmission[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/instructor/dashboard/assignments/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-body-text transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to assignment
        </Link>
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
            Submissions
          </h1>
          <p className="mt-1 text-sm text-mute-text">
            {submissions.length} {submissions.length === 1 ? "submission" : "submissions"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No submissions yet"
          description="Student submissions will appear here once they are turned in."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="rounded-3xl bg-white p-6 ring-1 ring-border transition-all duration-300 hover:shadow-lg hover:shadow-primary-pale"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-pale">
                  <GraduationCap className="size-5 text-ink-deep" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading text-base font-bold text-ink">
                    Student {s.studentId.slice(0, 8)}...
                  </h3>
                  <p className="mt-1 text-xs text-mute-text">
                    Submitted{" "}
                    {new Date(s.submittedAt ?? s.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {s.content && (
                <p className="mt-4 line-clamp-2 text-sm text-body-text">
                  {s.content}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-canvas-soft pt-4">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <FileText className="size-4 text-mute-text" />
                  {s.marks != null ? `${s.marks} pts` : "Not graded"}
                </span>
                <Badge
                  variant={s.marks != null ? "default" : "secondary"}
                  className="rounded-full"
                >
                  {s.marks != null ? "Graded" : "Pending"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmissionsPage;
