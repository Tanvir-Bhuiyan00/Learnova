"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getWishlist, removeFromWishlist } from "@/services/wishlist.services";
import { IWishlistItem } from "@/types/wishlist.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Bookmark, Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";

const WishlistPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => getWishlist(),
  });

  const items: IWishlistItem[] = data?.data ?? [];

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeFromWishlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          My wishlist
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Courses you want to learn next.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save courses you like and find them here later."
        >
          <Link href="/courses">
            <Button className="gap-2 rounded-full">
              Browse courses
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-3xl bg-white p-5 ring-1 ring-border transition-all duration-300 hover:shadow-lg hover:shadow-primary-pale"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-pale">
                  <Bookmark className="size-5 text-ink-deep" />
                </div>
                <p className="font-heading text-base font-bold text-ink">
                  Course {item.courseId.slice(0, 8)}...
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-mute-text hover:bg-negative/10 hover:text-negative"
                onClick={() => removeMutation.mutate(item.id)}
                aria-label="Remove from wishlist"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
