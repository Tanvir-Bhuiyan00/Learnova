"use client";

import { ProgressBar } from "@/components/shared/ProgressBar";
import StatsCard from "@/components/shared/StatsCard";
import { UpcomingList, UpcomingItem } from "@/components/shared/UpcomingList";
import { MiniCalendar } from "@/components/shared/MiniCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardData } from "@/services/dashboard.services";
import { getMyEnrollments } from "@/services/enrollment.services";
import { IStudentDashboardStats } from "@/types/dashboard.types";
import { IEnrollment } from "@/types/enrollment.types";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  ClipboardList,
  Play,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

const StudentDashboardContent = () => {
  const [tab, setTab] = useState<"active" | "completed">("active");

  const statsQuery = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: () => getDashboardData(),
  });
  const enrollmentsQuery = useQuery({
    queryKey: ["student-dashboard-enrollments"],
    queryFn: () => getMyEnrollments(),
  });

  const isLoading = statsQuery.isLoading || enrollmentsQuery.isLoading;
  const isError = statsQuery.isError || enrollmentsQuery.isError;
  const stats = (statsQuery.data as any)?.data as IStudentDashboardStats | null;
  const enrollments = ((enrollmentsQuery.data as any)?.data ?? []) as (IEnrollment & {
    course?: { id: string; title: string; thumbnail?: string | null; totalLessons?: number; instructor?: { name?: string } };
    lessonProgress?: { isCompleted: boolean }[];
    payment?: { amount?: number; status?: string };
  })[];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-16 text-center">
        <AlertTriangle className="size-10 text-negative" />
        <div>
          <h2 className="font-heading text-xl font-bold text-ink">
            Couldn&apos;t load your dashboard
          </h2>
          <p className="mt-1 text-sm text-mute-text">
            Something went wrong while fetching your stats.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  const activeCourses = enrollments.filter((e) => !e.isCompleted);
  const completedCourses = enrollments.filter((e) => e.isCompleted);
  const continueCourse = activeCourses[0];

  // Real numbers from the stats API (lessons/assignments/tests across the
  // student's enrolled courses)
  const totalLessons = stats?.totalLessons ?? 0;
  const completedLessons = stats?.lessonsCompleted ?? 0;
  const submittedAssignments = stats?.assignmentsSubmitted ?? 0;
  const totalAssignments = stats?.totalAssignments ?? 0;
  const completedQuizzes = stats?.quizzesTaken ?? 0;
  const totalQuizzes = stats?.totalQuizzes ?? 0;

  const upcoming: UpcomingItem[] = (stats?.upcoming ?? []).map((u) => ({
    id: u.id,
    type: u.type,
    title: u.title,
    date: u.date,
  }));

  const filtered = tab === "active" ? activeCourses : completedCourses;

  return (
    <div className="space-y-5">
      {/* Continue Learning Banner */}
      {continueCourse?.course && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg sm:flex-row sm:items-center"
        >
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/15">
            {continueCourse.course.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={continueCourse.course.thumbnail}
                alt={continueCourse.course.title}
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            ) : (
              <BookOpen className="size-7 text-white/70" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
              Continue learning
            </p>
            <h2 className="mt-0.5 truncate font-heading text-xl font-extrabold">
              {continueCourse.course.title}
            </h2>
            <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
              <span className="flex items-center gap-1">
                <BookOpen className="size-3.5" /> {continueCourse.course.totalLessons ?? 0} lessons
              </span>
              <span className="flex items-center gap-1">
                <ClipboardList className="size-3.5" /> {continueCourse.lessonProgress?.length ?? 0} done
              </span>
              <span className="ml-auto flex items-center gap-1 font-semibold text-white">
                {Math.round(continueCourse.progress)}%
              </span>
            </div>
          </div>
          <Link href={`/dashboard/courses/${continueCourse.courseId}/learn`}>
            <Button className="rounded-full bg-white text-indigo-700 hover:bg-white/90">
              <Play className="size-4" /> Resume
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Status Row — 3 stat cards: Lessons / Assignments / Tests */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="grid gap-4 md:grid-cols-3"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
          <StatsCard
            title="Lessons"
            value={completedLessons}
            iconName="BookOpen"
            description={`of ${totalLessons} completed`}
            progress={totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0}
            accent="orange"
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
          <StatsCard
            title="Assignments"
            value={submittedAssignments}
            iconName="ClipboardList"
            description={`of ${totalAssignments} submitted`}
            progress={totalAssignments > 0 ? (submittedAssignments / totalAssignments) * 100 : 0}
            accent="pink"
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
          <StatsCard
            title="Tests"
            value={completedQuizzes}
            iconName="Trophy"
            description={`of ${totalQuizzes} completed`}
            progress={totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0}
            accent="green"
          />
        </motion.div>
      </motion.div>

      {/* My Courses Table */}
      <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-extrabold text-ink">My Courses</h3>
          <div className="flex rounded-full bg-canvas-soft p-1">
            {(["active", "completed"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-all ${
                  tab === t ? "bg-white text-indigo-600 shadow-sm" : "text-mute-text"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-mute-text">
              {tab === "active" ? "No active courses yet" : "No completed courses yet"}
            </p>
            <Link href="/courses" className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline">
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left">
              <thead>
                <tr className="border-b border-canvas-soft text-xs font-bold uppercase tracking-wider text-mute-text">
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Progress</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-canvas-soft/60 last:border-0">
                    <td className="py-3 pr-3">
                      <Link
                        href={`/dashboard/courses/${e.courseId}/learn`}
                        className="flex items-center gap-3"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-canvas-soft">
                          {e.course?.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={e.course.thumbnail} alt={e.course?.title ?? ""} loading="lazy" decoding="async" className="size-full object-cover" />
                          ) : (
                            <BookOpen className="size-4 text-mute-text" />
                          )}
                        </span>
                        <span>
                          <span className="block max-w-[220px] truncate text-sm font-semibold text-ink">
                            {e.course?.title ?? "Course"}
                          </span>
                          <span className="block text-xs text-mute-text">
                            {e.course?.instructor?.name ?? ""}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="w-40 py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={e.progress} color="indigo" className="flex-1" />
                        <span className="text-xs font-bold text-ink">{Math.round(e.progress)}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={e.isCompleted ? "default" : "secondary"}
                        className="rounded-full"
                      >
                        {e.isCompleted ? "Completed" : "In progress"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right panel equivalent stacked below on smaller widths */}
      <div className="grid gap-4 xl:hidden md:grid-cols-2">
        <MiniCalendar />
        <UpcomingList items={upcoming} />
      </div>
    </div>
  );
};

export default StudentDashboardContent;