"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyPayments } from "@/services/payment.services";
import { IPayment } from "@/types/payment.types";
import { useQuery } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";

const PaymentHistoryPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-payments"],
    queryFn: () => getMyPayments(),
  });

  const payments: IPayment[] = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Payment History</h1>
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : payments.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12">
          <DollarSign className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No payments yet</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">${p.amount?.toFixed(2) ?? "0.00"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm">{p.status}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
