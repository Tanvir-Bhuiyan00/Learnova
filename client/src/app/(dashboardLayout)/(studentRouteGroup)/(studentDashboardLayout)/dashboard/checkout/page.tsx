"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { applyCoupon, getCart } from "@/services/cart.services";
import { checkout } from "@/services/enrollment.services";
import { ICartItem } from "@/types/cart.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

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
      if (res.success) { toast.success("Checkout successful!"); router.push("/dashboard/my-learning"); }
      else { toast.error(res.message || "Checkout failed"); }
    },
  });

  const couponMutation = useMutation({
    mutationFn: () => applyCoupon({ code: couponCode }),
    onSuccess: (res: any) => {
      if (res.success) { setDiscount(res.data?.discount || 10); toast.success("Coupon applied!"); }
      else { toast.error(res.message || "Invalid coupon"); }
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12">
          <ShoppingBag className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">Your cart is empty</p>
          <Button className="mt-4" onClick={() => router.push("/courses")}>Browse Courses</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Order Items ({items.length})</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <span className="text-sm">Course {item.courseId.slice(0, 8)}...</span>
                    <span className="text-sm font-medium">$100.00</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Coupon</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button variant="outline" onClick={() => couponMutation.mutate()} disabled={couponMutation.isPending || !couponCode}>
                  Apply
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
              <div className="flex justify-between border-t pt-2 text-lg font-bold"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <Button className="w-full mt-4" onClick={() => checkoutMutation.mutate()} disabled={checkoutMutation.isPending}>
                {checkoutMutation.isPending ? "Processing..." : "Pay Now"} <CreditCard className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
