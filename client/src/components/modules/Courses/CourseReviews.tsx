"use client";

import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { getReviews } from "@/services/review.services";
import { IReview } from "@/types/review.types";
import { useQuery } from "@tanstack/react-query";
import { MessageSquareQuote, Star } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-primary-pale text-ink-deep",
  "bg-ink-solid text-white",
  "bg-primary text-ink",
  "bg-amber-100 text-amber-800",
  "bg-sky-100 text-sky-800",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(dateString: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

const StarRow = ({ rating, className }: { rating: number; className?: string }) => (
  <div className={cn("flex items-center gap-0.5", className)}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={cn(
          "size-4",
          star <= rating
            ? "fill-amber-400 text-amber-400"
            : "fill-canvas-soft text-mute-text/50",
        )}
      />
    ))}
  </div>
);

const CourseReviews = ({ courseId }: { courseId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["reviews", courseId],
    queryFn: () => getReviews(`courseId=${courseId}`),
  });

  const reviews: IReview[] = data?.data ?? [];

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <section className="mt-14 border-t border-border pt-10">
      <h2 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
        Student reviews
      </h2>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-4 rounded-3xl bg-card p-6 ring-1 ring-border"
            >
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full max-w-lg" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={MessageSquareQuote}
          title="No reviews yet"
          description="Be the first student to share your experience with this course."
        />
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
          {/* Rating summary */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl bg-canvas-soft p-6 ring-1 ring-border">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-5xl font-black text-ink">
                  {average.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-mute-text">
                  / 5
                </span>
              </div>
              <StarRow rating={Math.round(average)} className="mt-2" />
              <p className="mt-2 text-sm text-mute-text">
                Based on {reviews.length}{" "}
                {reviews.length === 1 ? "review" : "reviews"}
              </p>

              <div className="mt-6 space-y-2">
                {distribution.map(({ star, count }) => (
                  <div
                    key={star}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="w-8 shrink-0 font-medium text-body-text">
                      {star} star
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-card ring-1 ring-border">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-mute-text">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Review list */}
          <div className="space-y-5">
            {reviews.map((review, index) => (
              <article
                key={review.id}
                className="rounded-3xl bg-card p-6 ring-1 ring-border"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {review.student?.profilePhoto ? (
                      <Image
                        src={review.student.profilePhoto}
                        alt={review.student.name}
                        width={44}
                        height={44}
                        className="size-11 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold",
                          AVATAR_COLORS[index % AVATAR_COLORS.length],
                        )}
                      >
                        {initials(review.student?.name ?? "Student")}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-ink">
                        {review.student?.name ?? "Anonymous student"}
                      </p>
                      <p className="text-xs text-mute-text">
                        {timeAgo(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StarRow rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="mt-4 leading-relaxed text-body-text">
                    {review.comment}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default CourseReviews;