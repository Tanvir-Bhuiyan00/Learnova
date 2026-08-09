import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingProps {
  rating: number;
  maxRating?: number;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Rating displays star ratings with theme-aware colors.
 *
 * @example
 * ```tsx
 * <Rating rating={4.5} showValue />
 * ```
 */
const Rating = ({ rating, maxRating = 5, showValue = false, size = "md", className }: RatingProps) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const isFilled = index < Math.floor(rating);
        const isPartial = index < rating && index >= Math.floor(rating);

        return (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              isFilled
                ? "fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500"
                : isPartial
                  ? "fill-yellow-400 text-yellow-400 dark:fill-yellow-500 dark:text-yellow-500"
                  : "fill-none text-muted"
            )}
          />
        );
      })}
      {showValue && (
        <span className={cn("ml-1 font-medium", textSizeClasses[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;
