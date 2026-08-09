"use client";

import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, PartyPopper } from "lucide-react";
import Link from "next/link";

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="mx-auto max-w-lg">
      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-border">
        <div className="bg-primary-pale p-10 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary">
            <PartyPopper className="size-10 text-ink" />
          </div>
          <h1 className="mt-6 font-heading text-3xl font-black tracking-tight text-ink">
            Payment successful!
          </h1>
          <p className="mt-2 text-body-text">
            Your payment has been processed and your courses are ready.
          </p>
        </div>

        <div className="p-8">
          {sessionId && (
            <div className="rounded-2xl bg-canvas-soft/60 px-4 py-3 text-center">
              <p className="text-xs text-mute-text">
                Transaction ID
              </p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-ink">
                {sessionId.slice(0, 24)}...
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-positive">
            <CheckCircle2 className="size-4" />
            Enrollment confirmed
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard/my-learning">
              <Button className="w-full gap-2 rounded-full">
                Go to My Learning
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" className="w-full rounded-full">
                Browse more courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
