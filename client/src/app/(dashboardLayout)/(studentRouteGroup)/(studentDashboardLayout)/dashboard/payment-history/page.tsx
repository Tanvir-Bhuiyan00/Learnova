"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyPayments } from "@/services/payment.services";
import { IPayment } from "@/types/payment.types";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

const PaymentHistoryPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-payments"],
    queryFn: () => getMyPayments(),
  });

  const payments: IPayment[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Payment history
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          A record of every transaction on your account.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 rounded-3xl" />
          <Skeleton className="h-20 rounded-3xl" />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="Your payment history will appear here after your first purchase."
        />
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 rounded-3xl bg-white p-5 ring-1 ring-border"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-pale">
                  <CreditCard className="size-5 text-ink-deep" />
                </div>
                <div>
                  <p className="font-heading text-lg font-extrabold text-ink">
                    ${p.amount?.toFixed(2) ?? "0.00"}
                  </p>
                  <p className="text-xs text-mute-text">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  p.status === "COMPLETED" || p.status === "PAID"
                    ? "default"
                    : "secondary"
                }
                className="rounded-full"
              >
                {p.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
