"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAssignments } from "@/services/assignment.services";
import { IAssignment } from "@/types/assignment.types";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";

const InstructorAssignmentsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-assignments"],
    queryFn: () => getAssignments(),
  });

  const assignments: IAssignment[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
            Assignments
          </h1>
          <p className="mt-1 text-sm text-mute-text">
            Manage assignments across your courses.
          </p>
        </div>
        <Button className="gap-2 rounded-full" asChild>
          <Link href="/instructor/dashboard/assignments/create">
            <Plus className="size-4" />
            Create assignment
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Create your first assignment to keep learners on track."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {assignments.map((a) => (
            <Link
              key={a.id}
              href={`/instructor/dashboard/assignments/${a.id}`}
              className="group flex flex-col rounded-3xl bg-white p-6 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-pale hover:ring-primary/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-pale">
                  <ClipboardList className="size-5 text-ink-deep" />
                </div>
              </div>

              <h3 className="mt-5 font-heading text-lg font-bold text-ink">
                {a.title}
              </h3>
              <div className="mt-4 flex items-center gap-4 border-t border-canvas-soft pt-4 text-sm">
                {a.dueDate && (
                  <span className="flex items-center gap-1.5 text-mute-text">
                    <CalendarDays className="size-4" />
                    {new Date(a.dueDate).toLocaleDateString()}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1 font-semibold text-ink">
                  <ArrowUpRight className="size-4" />
                  {a.totalMarks} pts
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorAssignmentsPage;
