import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SkeletonProps {
  className?: string;
  count?: number;
}

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface InlineProps {
  className?: string;
}

/**
 * LoadingState.Skeleton displays skeleton placeholders for loading content.
 *
 * @example
 * ```tsx
 * <LoadingState.Skeleton className="h-40 w-full" count={3} />
 * ```
 */
const Skeleton = ({ className, count = 1 }: SkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn("animate-pulse rounded-lg bg-muted", className)}
        />
      ))}
    </>
  );
};

/**
 * LoadingState.Spinner displays a centered animated spinner.
 *
 * @example
 * ```tsx
 * <LoadingState.Spinner size="lg" />
 * ```
 */
const Spinner = ({ className, size = "md" }: SpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
    </div>
  );
};

/**
 * LoadingState.Inline displays a small inline spinner for buttons or compact spaces.
 *
 * @example
 * ```tsx
 * <Button disabled>
 *   <LoadingState.Inline />
 *   Loading...
 * </Button>
 * ```
 */
const Inline = ({ className }: InlineProps) => {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
  );
};

/**
 * LoadingState compound component for consistent loading UI across the application.
 * Provides Skeleton, Spinner, and Inline variants.
 */
const LoadingState = {
  Skeleton,
  Spinner,
  Inline,
};

export default LoadingState;
