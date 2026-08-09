import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentSuccessLoading() {
  return (
    <div className="mx-auto max-w-lg p-6">
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
