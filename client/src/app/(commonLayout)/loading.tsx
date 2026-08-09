import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div>
      <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="mx-auto mb-4 h-12 w-96" />
          <Skeleton className="mx-auto mb-8 h-6 w-[500px]" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    </div>
  );
}
