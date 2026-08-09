"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { getReviews } from "@/services/review.services";
import { IReview } from "@/types/review.types";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

const InstructorReviewsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-reviews"],
    queryFn: () => getReviews(),
  });

  const reviews: IReview[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Course reviews
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          See what learners are saying about your courses.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="Learner reviews will appear here as your courses grow."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl bg-white p-6 ring-1 ring-border"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-base font-bold text-ink">
                  Student {r.studentId.slice(0, 8)}...
                </p>
                <div className="flex items-center gap-0.5">
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
              </div>
              <p className="mt-4 text-sm leading-relaxed text-body-text">
                {r.comment || "No comment provided."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorReviewsPage;
