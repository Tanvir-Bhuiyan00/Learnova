"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <CheckCircle className="mb-4 size-16 text-green-500" />
          <CardTitle className="mb-2 text-2xl">Payment Successful!</CardTitle>
          <p className="mb-2 text-muted-foreground">Your payment has been processed successfully.</p>
          {sessionId && (
            <p className="mb-6 text-xs text-muted-foreground">Transaction ID: {sessionId.slice(0, 20)}...</p>
          )}
          <div className="flex gap-3">
            <Link href="/dashboard/my-learning">
              <Button>Go to My Learning</Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline">Browse More Courses</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
