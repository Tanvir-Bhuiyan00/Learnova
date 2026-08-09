"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyReviews } from "@/services/review.services";
import { IReview } from "@/types/review.types";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

const MyReviewsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: () => getMyReviews(),
  });

  const reviews: IReview[] = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Reviews</h1>
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
      ) : reviews.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12">
          <Star className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No reviews yet</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-4 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Course: {r.courseId.slice(0, 8)}...</p>
              </CardHeader>
              <CardContent><p className="text-sm">{r.comment || "No comment"}</p></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;
