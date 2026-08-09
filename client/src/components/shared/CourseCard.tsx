import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ICourse } from "@/types/course.types";
import { BookOpen, User } from "lucide-react";
import Link from "next/link";
import Rating from "./Rating";

interface CourseCardProps {
  course: ICourse;
  className?: string;
  showInstructor?: boolean;
}

/**
 * CourseCard displays course information in a consistent card layout.
 * Used across home page, course listings, and search results.
 *
 * @example
 * ```tsx
 * <CourseCard course={courseData} />
 * ```
 */
const CourseCard = ({ course, className, showInstructor = false }: CourseCardProps) => {
  const displayPrice = course.discountPrice ?? course.price;
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;

  return (
    <Link
      href={`/courses/${course.id}`}
      className={cn(
        "group rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md bg-card",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-md bg-muted">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={`Course thumbnail for ${course.title}`}
            className="size-full object-cover"
          />
        ) : (
          <BookOpen className="size-12 text-muted-foreground" />
        )}
      </div>

      {/* Title */}
      <h3 className="mb-1 font-semibold group-hover:text-primary transition-colors line-clamp-2">
        {course.title}
      </h3>

      {/* Description */}
      {course.description && (
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <User className="size-3.5" />
          {course.totalStudents}
        </span>
        <Rating rating={course.averageRating} size="sm" />
        <span className="ml-auto font-semibold text-foreground">
          {hasDiscount && (
            <span className="mr-2 text-xs line-through text-muted-foreground">
              ${course.price.toFixed(2)}
            </span>
          )}
          ${displayPrice.toFixed(2)}
        </span>
      </div>

      {/* Level Badge */}
      {course.level && (
        <Badge variant="secondary" className="mt-3">
          {course.level.replace("_", " ")}
        </Badge>
      )}
    </Link>
  );
};

export default CourseCard;
