import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ICourse } from "@/types/course.types";
import { BookOpen, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Rating from "./Rating";

interface CourseCardProps {
  course: ICourse;
  className?: string;
  showInstructor?: boolean;
}

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All levels",
};

/**
 * CourseCard displays course information in a consistent Wise-style card layout.
 * Used across home page, course listings, and search results.
 *
 * @example
 * ```tsx
 * <CourseCard course={courseData} />
 * ```
 */
const CourseCard = ({ course, className }: CourseCardProps) => {
  const displayPrice = course.discountPrice ?? course.price;
  const hasDiscount =
    course.discountPrice != null && course.discountPrice < course.price;

  return (
    <Link
      href={`/courses/${course.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-pale hover:ring-primary/50",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-canvas-soft">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={`Course thumbnail for ${course.title}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <BookOpen className="size-14 text-mute-text" />
        )}
        {course.level && (
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 rounded-full border-0 bg-card/90 text-ink-deep backdrop-blur"
          >
            {levelLabels[course.level] ?? course.level.replace("_", " ")}
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3 className="line-clamp-2 font-heading text-lg font-bold leading-snug text-ink">
          {course.title}
        </h3>

        {course.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-body-text">
            {course.description}
          </p>
        )}

        {course.totalDuration ? (
          <p className="text-xs font-medium text-mute-text">
            {course.totalLessons} lessons ·{" "}
            {Math.max(1, Math.round(course.totalDuration / 60))} hours
          </p>
        ) : (
          <p className="text-xs font-medium text-mute-text">
            {course.totalLessons} lessons
          </p>
        )}

        {/* Meta row */}
        <div className="mt-auto flex items-end justify-between border-t border-canvas-soft pt-4">
          <div className="flex flex-col gap-1">
            <Rating rating={course.averageRating} size="sm" showValue />
            <span className="flex items-center gap-1 text-xs text-mute-text">
              <Users className="size-3.5" />
              {course.totalStudents.toLocaleString()} students
            </span>
          </div>
          <div className="text-right">
            {hasDiscount && (
              <p className="text-xs text-mute-text line-through">
                ${course.price.toFixed(2)}
              </p>
            )}
            <p className="font-heading text-lg font-extrabold text-ink">
              ${displayPrice.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
