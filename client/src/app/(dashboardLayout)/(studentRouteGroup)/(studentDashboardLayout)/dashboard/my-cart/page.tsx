"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCart, removeFromCart } from "@/services/cart.services";
import { ICartItem } from "@/types/cart.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";

const MyCartPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart(),
  });

  const items: ICartItem[] = (data?.data as any)?.items ?? [];

  const removeMutation = useMutation({
    mutationFn: (courseId: string) => removeFromCart(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          My cart
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          {items.length} {items.length === 1 ? "item" : "items"} ready to check
          out
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse courses and add something you love."
        >
          <Link href="/courses">
            <Button className="gap-2 rounded-full">
              Browse courses
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-3xl bg-white p-5 ring-1 ring-border"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-pale">
                  <ShoppingCart className="size-5 text-ink-deep" />
                </div>
                <div>
                  <p className="font-heading text-base font-bold text-ink">
                    Course {item.courseId.slice(0, 8)}...
                  </p>
                  <p className="text-sm text-mute-text">Qty: {item.quantity}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-mute-text hover:bg-negative/10 hover:text-negative"
                onClick={() => removeMutation.mutate(item.courseId)}
                aria-label="Remove from cart"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}

          <Link href="/dashboard/checkout">
            <Button className="w-full gap-2 rounded-full" size="lg">
              Proceed to checkout
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyCartPage;
