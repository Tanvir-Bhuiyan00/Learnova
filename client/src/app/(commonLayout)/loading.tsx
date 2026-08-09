import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div>
      <div className="bg-canvas-soft py-24">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="mx-auto h-4 w-40 rounded-full" />
          <Skeleton className="mx-auto mt-6 h-14 w-[560px] max-w-full rounded-2xl" />
          <Skeleton className="mx-auto mt-6 h-5 w-[380px] max-w-full rounded-full" />
          <div className="mt-9 flex justify-center gap-3">
            <Skeleton className="h-14 w-44 rounded-full" />
            <Skeleton className="h-14 w-44 rounded-full" />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <Skeleton className="mb-8 h-9 w-56 rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
