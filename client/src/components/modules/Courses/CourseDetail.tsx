"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  checkEnrollmentAction,
  enrollNowAction,
} from "@/app/_actions/enrollment.actions";
import { getCourseById } from "@/services/course.services";
import { ICourseDetail } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Globe,
  Layers,
  MonitorPlay,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/shared/PageContainer";
import CourseImage from "@/components/shared/CourseImage";
import CourseReviews from "./CourseReviews";
import { motion } from "motion/react";

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
  const router = useRouter();
  const [isEnrolling, startEnrollTransition] = useTransition();
  const [enrollmentState, setEnrollmentState] = useState<{
    enrolled: boolean;
    isPaid: boolean;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
  });

  useEffect(() => {
    let cancelled = false;
    checkEnrollmentAction(courseId)
      .then((state) => {
        if (!cancelled) setEnrollmentState(state);
      })
      .catch(() => {
        if (!cancelled) setEnrollmentState({ enrolled: false, isPaid: false });
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const course: ICourseDetail | undefined = data?.data;

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

  const handleEnroll = () => {
    startEnrollTransition(async () => {
      const result = await enrollNowAction(course.id);

      if (result.success) {
        router.push("/dashboard/checkout");
      } else {
        toast.error(result.error ?? "Could not enroll in this course.");
      }
    });
  };

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
              <Badge className="rounded-full border-0 bg-ink-solid text-primary">
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
            <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">
              {course.thumbnail && (
                <CourseImage
                  src={course.thumbnail}
                  alt={course.title}
                  width={600}
                  height={300}
                  priority
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

                {enrollmentState?.enrolled ? (
                  <>
                    <Button
                      className="mt-5 w-full rounded-full"
                      size="lg"
                      variant="secondary"
                      onClick={() => router.push("/dashboard/my-learning")}
                    >
                      <BookOpen className="size-4" />
                      Go to course
                    </Button>
                    <p className="mt-3 text-center text-xs text-mute-text">
                      You&apos;re enrolled in this course.
                    </p>
                  </>
                ) : (
                  <>
                    <Button
                      className="mt-5 w-full rounded-full"
                      size="lg"
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? "Adding to cart..." : "Enroll now"}
                    </Button>
                    <p className="mt-3 text-center text-xs text-mute-text">
                      30-day money-back guarantee
                    </p>
                  </>
                )}

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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
        >
          <CourseCurriculum course={course} />
        </motion.div>

        {course.instructor && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-16"
          >
            <CourseInstructorCard course={course} />
          </motion.div>
        )}
      </PageContainer>

      <PageContainer spacing="lg">
        <CourseReviews courseId={course.id} />
      </PageContainer>
    </div>
  );
};

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs} hr ${rem} min` : `${hrs} hr`;
}

function CourseCurriculum({ course }: { course: ICourseDetail }) {
  const modules = course.modules ?? [];
  const lessons = modules.flatMap((mod) => mod.lessons ?? []);
  const [openModules, setOpenModules] = useState<Set<string>>(
    () => new Set(modules.length > 0 ? [modules[0].id] : []),
  );

  const learnPoints = [
    ...new Set(lessons.map((lesson) => lesson.title)),
  ].slice(0, 6);

  const toggleModule = (id: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-12">
      {learnPoints.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
            What you&apos;ll learn
          </h2>
          <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {learnPoints.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 text-sm text-body-text"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-positive" />
                {point}
              </div>
            ))}
          </div>
        </section>
      )}

      {modules.length > 0 && (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
              Course content
            </h2>
            <span className="flex items-center gap-1.5 text-sm text-mute-text">
              <Layers className="size-4" />
              {modules.length} modules · {lessons.length} lessons
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {modules.map((module) => {
              const isOpen = openModules.has(module.id);
              const moduleLessons = module.lessons ?? [];
              return (
                <div
                  key={module.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-canvas-soft/60"
                  >
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="size-4 text-mute-text" />
                    </motion.span>
                    <span className="flex-1 text-base font-bold text-ink">
                      {module.title}
                    </span>
                    <span className="text-xs font-medium text-mute-text">
                      {moduleLessons.length}{" "}
                      {moduleLessons.length === 1 ? "lesson" : "lessons"}
                    </span>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <ul className="divide-y divide-canvas-soft border-t border-canvas-soft">
                      {moduleLessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="flex items-center gap-3 px-5 py-3.5"
                        >
                          <PlayCircle className="size-4 shrink-0 text-primary" />
                          <span className="flex-1 text-sm text-body-text">
                            {lesson.title}
                          </span>
                          {lesson.isFree && (
                            <span className="rounded-full bg-positive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-positive">
                              Free
                            </span>
                          )}
                          {formatDuration(lesson.videoDuration) && (
                            <span className="text-xs text-mute-text">
                              {formatDuration(lesson.videoDuration)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function CourseInstructorCard({ course }: { course: ICourseDetail }) {
  const instructor = course.instructor!;
  return (
    <section className="rounded-3xl bg-card p-8 ring-1 ring-border">
      <h2 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
        Your instructor
      </h2>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
        {instructor.profilePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={instructor.profilePhoto}
            alt={instructor.name}
            className="size-20 shrink-0 rounded-full object-cover ring-2 ring-primary/30"
          />
        ) : (
          <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-pale font-heading text-2xl font-extrabold text-white">
            {instructor.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <p className="font-heading text-xl font-bold text-ink">
            {instructor.name}
          </p>
          {instructor.designation && (
            <p className="mt-0.5 text-sm font-medium text-primary">
              {instructor.designation}
            </p>
          )}
          {instructor.qualification && (
            <p className="mt-1 text-sm text-body-text">
              {instructor.qualification}
            </p>
          )}
          {instructor.bio && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body-text">
              {instructor.bio}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-body-text">
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {instructor.averageRating.toFixed(1)} instructor rating
            </span>
            {instructor.experience ? (
              <span>{instructor.experience} years experience</span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CourseDetail;
