"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourseById } from "@/services/course.services";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  Globe,
  MonitorPlay,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/shared/PageContainer";
import CourseReviews from "./CourseReviews";

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All Levels",
};

interface CourseDetailProps {
  courseId: string;
}

const CourseDetail = ({ courseId }: CourseDetailProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
  });

  const course: ICourse | undefined = data?.data;

  if (isLoading) {
    return (
      <PageContainer spacing="lg">
        <Skeleton className="h-5 w-32" />
        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-14 w-full max-w-2xl" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </PageContainer>
    );
  }

  if (!course) {
    return (
      <PageContainer spacing="lg" className="text-center">
        <BookOpen className="mx-auto size-12 text-mute-text" />
        <p className="mt-4 text-lg font-semibold text-ink">
          Course not found.
        </p>
        <Link
          href="/courses"
          className="mt-2 inline-block text-sm font-semibold text-ink-deep hover:text-primary-hover"
        >
          Back to courses
        </Link>
      </PageContainer>
    );
  }

  const displayPrice = course.discountPrice ?? course.price;
  const hasDiscount =
    course.discountPrice != null && course.discountPrice < course.price;

  return (
    <div>
      <section className="bg-canvas-soft py-14 md:py-16">
        <PageContainer>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-body-text transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Back to courses
          </Link>

          <div className="mt-8 flex flex-wrap gap-2">
            {course.level && (
              <Badge className="rounded-full border-0 bg-ink text-primary">
                {levelLabels[course.level] ?? course.level.replace("_", " ")}
              </Badge>
            )}
            <Badge variant="secondary" className="rounded-full">
              {course.language}
            </Badge>
          </div>

          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-black leading-[1.02] tracking-tight text-ink md:text-5xl">
            {course.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-body-text">
            {course.description || "No description available."}
          </p>

          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm text-body-text">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {course.averageRating.toFixed(1)}
              <span className="text-mute-text">rating</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4" />
              {course.totalStudents.toLocaleString()} students
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-4" />
              {course.totalLessons} lessons
            </span>
            {course.totalDuration && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {Math.max(1, Math.round(course.totalDuration / 60))} hours
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Globe className="size-4" />
              {course.language}
            </span>
          </div>
        </PageContainer>
      </section>

      <PageContainer spacing="lg">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
              About this course
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-body-text">
              {course.description ||
                "No description available. Check back soon for a full overview of this course."}
            </p>
          </div>

          {/* Purchase card */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-border">
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-52 w-full object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-baseline gap-2">
                  {hasDiscount && (
                    <span className="text-lg text-mute-text line-through">
                      ${course.price.toFixed(2)}
                    </span>
                  )}
                  <span className="font-heading text-3xl font-black text-ink">
                    ${displayPrice.toFixed(2)}
                  </span>
                </div>
                {hasDiscount && (
                  <p className="mt-1 text-sm font-semibold text-positive">
                    You save ${(course.price - (course.discountPrice ?? course.price)).toFixed(2)}
                  </p>
                )}

                <Button className="mt-5 w-full rounded-full" size="lg">
                  Enroll now
                </Button>
                <p className="mt-3 text-center text-xs text-mute-text">
                  30-day money-back guarantee
                </p>

                <ul className="mt-6 space-y-3 border-t border-canvas-soft pt-6 text-sm text-body-text">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 shrink-0 text-positive" />
                    Full lifetime access
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 shrink-0 text-positive" />
                    Certificate of completion
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 shrink-0 text-positive" />
                    Access on mobile and desktop
                  </li>
                  <li className="flex items-center gap-2.5">
                    <MonitorPlay className="size-4 shrink-0 text-primary" />
                    {course.totalLessons} video lessons included
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      <PageContainer spacing="lg">
        <CourseReviews courseId={course.id} />
      </PageContainer>
    </div>
  );
};

export default CourseDetail;
