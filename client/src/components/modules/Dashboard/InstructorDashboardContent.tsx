"use client";

import { ProgressBar } from "@/components/shared/ProgressBar";
import StatsCard from "@/components/shared/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardData } from "@/services/dashboard.services";
import { getCourses } from "@/services/course.services";
import { IInstructorDashboardStats } from "@/types/dashboard.types";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock,
  Plus,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const InstructorDashboardContent = () => {
  const statsQuery = useQuery({
    queryKey: ["instructor-dashboard"],
    queryFn: () => getDashboardData(),
  });
  const coursesQuery = useQuery({
    queryKey: ["instructor-dashboard-courses"],
    queryFn: () => getCourses("limit=50"),
  });

  const isLoading = statsQuery.isLoading || coursesQuery.isLoading;
  const isError = statsQuery.isError || coursesQuery.isError;
  const stats = (statsQuery.data as any)?.data as IInstructorDashboardStats | null;
  const courses = ((coursesQuery.data as any)?.data ?? []) as ICourse[];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-16 text-center">
        <AlertTriangle className="size-10 text-negative" />
        <p className="font-heading text-xl font-bold text-ink">Couldn&apos;t load your dashboard</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  const published = courses.filter((c) => c.status === "PUBLISHED");
  const drafts = courses.filter((c) => c.status !== "PUBLISHED");
  const avgRating = stats?.averageRating ?? 0;

  const recentReviews = stats?.recentReviews?.slice(0, 5) ?? [];

  return (
    <div className="space-y-5">
      {/* Status Row */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="grid gap-4 md:grid-cols-3"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
          <StatsCard
            title="Total Students"
            value={stats?.totalStudents ?? 0}
            iconName="Users"
            description="Across all your courses"
            progress={Math.min(100, (stats?.totalStudents ?? 0) * 5)}
            accent="orange"
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
          <StatsCard
            title="Pending Submissions"
            value={recentReviews.length}
            iconName="Clock"
            description="Awaiting your attention"
            progress={Math.min(100, recentReviews.length * 20)}
            accent="pink"
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
          <StatsCard
            title="Published Courses"
            value={published.length}
            iconName="BookOpen"
            description={`${drafts.length} in draft`}
            progress={courses.length > 0 ? (published.length / courses.length) * 100 : 0}
            accent="green"
          />
        </motion.div>
      </motion.div>

      {/* Header row with rating + create */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-ink ring-1 ring-border">
          <Star className="size-4 text-amber-500" /> {avgRating.toFixed(1)} avg rating
          <span className="text-mute-text">· {stats?.totalReviews ?? 0} reviews</span>
        </div>
        <Link href="/instructor/dashboard/courses/create">
          <Button className="rounded-full">
            <Plus className="size-4" /> Create Course
          </Button>
        </Link>
      </div>

      {/* My Courses Table */}
      <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
        <h3 className="mb-4 font-heading text-lg font-extrabold text-ink">My Courses</h3>
        {courses.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-mute-text">No courses yet</p>
            <Link href="/instructor/dashboard/courses/create" className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline">
              Create your first course
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="border-b border-canvas-soft text-xs font-bold uppercase tracking-wider text-mute-text">
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Students</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3">Completion</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.slice(0, 6).map((c) => (
                  <tr key={c.id} className="border-b border-canvas-soft/60 last:border-0">
                    <td className="py-3 pr-3">
                      <Link href={`/instructor/dashboard/courses/${c.id}/edit`} className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-canvas-soft">
                          {c.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.thumbnail} alt={c.title} className="size-full object-cover" />
                          ) : (
                            <BookOpen className="size-4 text-mute-text" />
                          )}
                        </span>
                        <span className="block max-w-[200px] truncate text-sm font-semibold text-ink">{c.title}</span>
                      </Link>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="flex items-center gap-1 text-sm text-body-text">
                        <Users className="size-3.5 text-mute-text" /> {c.totalStudents}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-sm font-semibold text-ink">{c.averageRating.toFixed(1)}</td>
                    <td className="w-32 py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={Math.min(100, c.totalStudents * 8)} color="indigo" className="flex-1" />
                        <span className="text-xs font-bold text-ink">{Math.min(100, c.totalStudents * 8)}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={c.status === "PUBLISHED" ? "default" : "secondary"} className="rounded-full">
                        {c.status === "PUBLISHED" ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Link href={`/instructor/dashboard/courses/${c.id}/edit`}>
                        <Button variant="outline" size="sm" className="rounded-full text-xs">
                          Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
        <h3 className="mb-4 font-heading text-lg font-extrabold text-ink">Recent Reviews</h3>
        {recentReviews.length === 0 ? (
          <p className="py-6 text-center text-sm text-mute-text">No reviews yet</p>
        ) : (
          <ul className="space-y-3">
            {recentReviews.map((r) => (
              <li key={r.id} className="flex items-start gap-3 rounded-xl border border-canvas-soft p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-pale text-xs font-bold text-ink-deep">
                  {r.studentName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{r.studentName}</p>
                  <p className="truncate text-xs text-mute-text">{r.comment ?? "No comment"}</p>
                </div>
                <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <Star className="size-3.5 fill-current" /> {r.rating}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboardContent;