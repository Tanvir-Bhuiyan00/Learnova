"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { getMyReviews } from "@/services/review.services";
import { IReview } from "@/types/review.types";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Star } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

const MyReviewsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: () => getMyReviews(),
  });

  const reviews: IReview[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          My reviews
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          What you have shared with the community.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="Finish a course and share your thoughts with other learners."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl bg-white p-6 ring-1 ring-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < r.rating
                          ? "size-4 fill-amber-400 text-amber-400"
                          : "size-4 text-mute-text"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-mute-text">
                  Course {r.courseId.slice(0, 8)}...
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-body-text">
                {r.comment || "No comment provided."}
              </p>
              <p className="mt-4 text-xs text-mute-text">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;
