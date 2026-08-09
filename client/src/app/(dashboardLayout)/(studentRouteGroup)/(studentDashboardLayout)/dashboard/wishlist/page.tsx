"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getWishlist, removeFromWishlist } from "@/services/wishlist.services";
import { IWishlistItem } from "@/types/wishlist.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Trash2 } from "lucide-react";
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["wishlist"] }); toast.success("Removed from wishlist"); },
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Wishlist</h1>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12">
          <Heart className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">Your wishlist is empty</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Course {item.courseId.slice(0, 8)}...</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeMutation.mutate(item.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
