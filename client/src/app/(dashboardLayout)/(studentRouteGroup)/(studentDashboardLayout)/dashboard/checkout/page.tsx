"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { applyCoupon, getCart } from "@/services/cart.services";
import { checkout } from "@/services/enrollment.services";
import { ICartItem } from "@/types/cart.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, ShoppingBag, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CheckoutPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart(),
  });

  const items: ICartItem[] = (data?.data as any)?.items ?? [];
  const subtotal = items.length * 100; // placeholder price
  const total = Math.max(0, subtotal - discount);

  const checkoutMutation = useMutation({
    mutationFn: () => checkout(),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        toast.success("Checkout successful!");
        router.push("/dashboard/my-learning");
      } else {
        toast.error(res.message || "Checkout failed");
      }
    },
  });

  const couponMutation = useMutation({
    mutationFn: () => applyCoupon({ code: couponCode }),
    onSuccess: (res: any) => {
      if (res.success) {
        setDiscount(res.data?.discount || 10);
        toast.success("Coupon applied!");
      } else {
        toast.error(res.message || "Invalid coupon");
      }
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Review your order and complete payment.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-72 rounded-3xl" />
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-12 text-center">
          <ShoppingBag className="mx-auto size-12 text-mute-text" />
          <p className="mt-4 text-lg font-semibold text-ink">
            Your cart is empty
          </p>
          <Button
            className="mt-5 rounded-full"
            onClick={() => router.push("/courses")}
          >
            Browse courses
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <Card className="ring-1 ring-border">
            <div className="border-b border-canvas-soft p-6 pb-4">
              <h2 className="font-heading text-lg font-bold text-ink">
                Order items ({items.length})
              </h2>
            </div>
            <CardContent className="space-y-3 p-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-canvas-soft/50 px-4 py-3"
                >
                  <span className="text-sm font-medium text-ink">
                    Course {item.courseId.slice(0, 8)}...
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    $100.00
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="ring-1 ring-border">
            <div className="border-b border-canvas-soft p-6 pb-4">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-ink">
                <Ticket className="size-5 text-ink-deep" />
                Coupon
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="rounded-full border-border bg-canvas-soft/70 focus-visible:bg-white"
                />
                <Button
                  variant="outline"
                  className="shrink-0 rounded-full"
                  onClick={() => couponMutation.mutate()}
                  disabled={couponMutation.isPending || !couponCode}
                >
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="ring-1 ring-border">
            <div className="border-b border-canvas-soft p-6 pb-4">
              <h2 className="font-heading text-lg font-bold text-ink">
                Order summary
              </h2>
            </div>
            <CardContent className="space-y-2.5 p-6">
              <div className="flex justify-between text-sm">
                <span className="text-body-text">Subtotal</span>
                <span className="font-semibold text-ink">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-body-text">Discount</span>
                  <span className="font-semibold text-positive">
                    -${discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-canvas-soft pt-3 font-heading text-xl font-extrabold text-ink">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button
                className="mt-4 w-full gap-2 rounded-full"
                size="lg"
                onClick={() => checkoutMutation.mutate()}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? "Processing..." : "Pay now"}
                {!checkoutMutation.isPending && (
                  <CreditCard className="size-4" />
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
