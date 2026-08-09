"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourses } from "@/services/course.services";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BookOpen, Plus, Star, Users } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All Levels",
};

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  ARCHIVED: "outline",
};

const InstructorCoursesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => getCourses(),
  });

  const courses: ICourse[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
            My courses
          </h1>
          <p className="mt-1 text-sm text-mute-text">
            Create, manage, and publish your courses.
          </p>
        </div>
        <Link href="/instructor/dashboard/courses/create">
          <Button className="gap-2 rounded-full">
            <Plus className="size-4" />
            Create course
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-3xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to start teaching."
        >
          <Link href="/instructor/dashboard/courses/create">
            <Button className="gap-2 rounded-full">
              <Plus className="size-4" />
              Create course
            </Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/instructor/dashboard/courses/${course.id}/edit`}
              className="group flex flex-col rounded-3xl bg-white p-6 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-pale hover:ring-primary/50"
            >
              <div className="flex items-center justify-between">
                <Badge
                  variant={statusVariants[course.status] ?? "secondary"}
                  className="rounded-full"
                >
                  {course.status}
                </Badge>
                <span className="flex size-9 items-center justify-center rounded-full bg-canvas-soft text-body-text transition-colors group-hover:bg-primary group-hover:text-ink">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>

              <h3 className="mt-4 line-clamp-2 font-heading text-lg font-bold leading-snug text-ink">
                {course.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-body-text">
                {course.description || "No description yet."}
              </p>

              <div className="mt-auto flex items-center gap-4 border-t border-canvas-soft pt-4 text-sm">
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  <Users className="size-4 text-mute-text" />
                  {course.totalStudents}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {course.averageRating.toFixed(1)}
                </span>
                <span className="ml-auto text-xs font-semibold text-mute-text">
                  {levelLabels[course.level] ?? course.level.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCoursesPage;
