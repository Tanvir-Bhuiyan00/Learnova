"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCart, removeFromCart } from "@/services/cart.services";
import { ICartItem } from "@/types/cart.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cart"] }); toast.success("Removed from cart"); },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">My Cart</h1>
        <p className="text-sm text-muted-foreground">{items.length} item(s)</p>
      </div>
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
      ) : items.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12">
          <ShoppingCart className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">Your cart is empty</p>
          <Link href="/courses"><Button className="mt-4">Browse Courses</Button></Link>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Course {item.courseId.slice(0, 8)}...</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeMutation.mutate(item.courseId)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
          <Link href="/dashboard/checkout"><Button className="w-full">Proceed to Checkout</Button></Link>
        </div>
      )}
    </div>
  );
};

export default MyCartPage;
