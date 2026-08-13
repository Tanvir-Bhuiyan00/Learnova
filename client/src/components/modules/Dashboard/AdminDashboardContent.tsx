"use client";

import dynamic from "next/dynamic";
import StatsCard from "@/components/shared/StatsCard";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MiniCalendar } from "@/components/shared/MiniCalendar";
import { UpcomingList, UpcomingItem } from "@/components/shared/UpcomingList";
import { getDashboardData } from "@/services/dashboard.services";
import { ApiResponse } from "@/types/api.types";
import { ISuperAdminDashboardStats } from "@/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  CreditCard,
  GraduationCap,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const EnrollmentBarChart = dynamic(
  () => import("@/components/shared/EnrollmentBarChart").then((m) => m.default),
  { ssr: false },
);

const EnrollmentPieChart = dynamic(
  () => import("@/components/shared/EnrollmentPieChart").then((m) => m.default),
  { ssr: false },
);

const quickActions = [
  { label: "Manage Courses", href: "/admin/dashboard/courses-management", icon: BookOpen, color: "text-blue-600" },
  { label: "Add Instructor", href: "/admin/dashboard/instructors-management", icon: GraduationCap, color: "text-green-600" },
  { label: "View Payments", href: "/admin/dashboard/payments-management", icon: CreditCard, color: "text-emerald-600" },
  { label: "Manage Users", href: "/admin/dashboard/users-management", icon: Users, color: "text-indigo-600" },
];

const AdminDashboardContent = () => {
  const { data: adminDashboardData, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-dashboard-data"],
    queryFn: getDashboardData,
  });

  const { data } = adminDashboardData as ApiResponse<ISuperAdminDashboardStats>;

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

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed p-16 text-center">
        <AlertTriangle className="size-10 text-negative" />
        <p className="font-heading text-xl font-bold text-ink">Couldn&apos;t load your dashboard</p>
        <Button variant="outline" onClick={() => refetch()} className="rounded-full">
          <RefreshCw className="size-4" /> Try again
        </Button>
      </div>
    );
  }

  const topCourses = data?.topCourses?.slice(0, 5) ?? [];
  const maxEnrollments = Math.max(1, ...topCourses.map((c) => c.enrollmentCount));

  // Recent activity — real latest enrollments, payments, and user signups
  const recentActivity = (data?.recentActivity ?? []).slice(0, 6);

  // Needs-attention feed: surfaced from the latest platform activity
  const attentionItems: UpcomingItem[] = recentActivity.map((a) => ({
    id: a.id,
    type: a.type === "payment" ? "event" : "test",
    title:
      a.type === "payment"
        ? `Payment · ${a.userName}`
        : a.type === "signup"
          ? `New signup · ${a.userName}`
          : `Enrollment · ${a.userName}`,
    date: a.createdAt,
  }));

  const rightPanel = (
    <div className="space-y-4">
      <MiniCalendar />
      <UpcomingList
        items={attentionItems}
        emptyText="Nothing needs attention"
      />
    </div>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <div className="min-w-0 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-black tracking-tight text-ink">
            Overview
          </h1>
          <p className="mt-0.5 text-sm text-mute-text">
            A snapshot of your platform at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary-pale px-4 py-2 text-sm font-semibold text-ink-deep">
          <TrendingUp className="size-4" />
          Total Revenue{" "}
          <span className="ml-1 font-heading text-lg font-extrabold">
            ৳{(data?.totalRevenue ?? 0).toLocaleString("en-US")}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Link href={action.href} key={action.label}>
            <Button
              variant="outline"
              className="gap-2 rounded-full bg-card px-4 text-sm font-medium ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <action.icon className={`size-4 ${action.color}`} />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Status Row */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="grid gap-4 md:grid-cols-3"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
          <StatsCard
            title="Total Users"
            value={(data?.totalUsers ?? 0).toLocaleString()}
            iconName="Users"
            description={`${data?.totalInstructors ?? 0} instructors · ${data?.totalStudents ?? 0} students`}
            progress={Math.min(100, (data?.totalUsers ?? 0) * 4)}
            accent="orange"
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
          <StatsCard
            title="Total Courses"
            value={(data?.totalCourses ?? 0).toLocaleString()}
            iconName="BookOpen"
            description={`${data?.totalEnrollments ?? 0} enrollments`}
            progress={Math.min(100, (data?.totalCourses ?? 0) * 6)}
            accent="pink"
          />
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
          <StatsCard
            title="Total Revenue"
            value={`৳${(data?.totalRevenue ?? 0).toLocaleString()}`}
            iconName="CreditCard"
            description={`৳${((data?.totalRevenue ?? 0) / Math.max(1, data?.totalEnrollments ?? 1)).toFixed(0)} avg / enrollment`}
            progress={Math.min(100, ((data?.totalRevenue ?? 0) / 1000) % 100)}
            accent="green"
          />
        </motion.div>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <EnrollmentBarChart data={data?.revenueByMonth || []} />
        <EnrollmentPieChart
          data={data?.userRoleDistribution || []}
          title="User Role Distribution"
          description="Distribution of users by role"
        />
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
        <h3 className="mb-4 font-heading text-lg font-extrabold text-ink">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="py-6 text-center text-sm text-mute-text">No recent activity</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left">
              <thead>
                <tr className="border-b border-canvas-soft text-xs font-bold uppercase tracking-wider text-mute-text">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Course / Amount</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((a) => (
                  <tr key={a.id} className="border-b border-canvas-soft/60 last:border-0">
                    <td className="py-3 pr-3">
                      <span className="flex items-center gap-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-pale text-xs font-bold text-ink-deep">
                          {a.userName.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold text-ink">{a.userName}</span>
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-sm text-body-text">
                      {a.type === "payment" ? "Purchased" : a.type === "signup" ? "Signed up" : "Enrolled in"}
                    </td>
                    <td className="py-3 pr-3 text-sm font-medium text-ink">
                      {a.amount != null ? `৳${a.amount.toLocaleString()}` : a.detail}
                    </td>
                    <td className="py-3 pr-3 text-xs text-mute-text">
                      {new Date(a.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Courses */}
      <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
        <h3 className="mb-4 font-heading text-lg font-extrabold text-ink">Top Courses</h3>
        {topCourses.length === 0 ? (
          <p className="py-6 text-center text-sm text-mute-text">No course data yet</p>
        ) : (
          <ul className="space-y-3">
            {topCourses.map((c) => (
              <li key={c.id} className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-canvas-soft">
                  {c.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.thumbnail} alt={c.title} loading="lazy" decoding="async" className="size-full object-cover" />
                  ) : (
                    <BookOpen className="size-4 text-mute-text" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{c.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <ProgressBar
                      value={(c.enrollmentCount / maxEnrollments) * 100}
                      color="indigo"
                      className="flex-1"
                    />
                    <span className="text-xs font-bold text-ink">{c.enrollmentCount} students</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>

      {/* Right panel on wide screens */}
      <aside className="hidden min-w-0 xl:block">
        <div className="sticky top-0 space-y-4">{rightPanel}</div>
      </aside>
    </div>
  );
};

export default AdminDashboardContent;