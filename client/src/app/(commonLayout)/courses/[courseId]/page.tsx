import CourseDetail from "@/components/modules/Courses/CourseDetail";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

// Regenerate this static page at most once per minute.
export const revalidate = 60;

interface CourseDetailParams {
  params: Promise<{ courseId: string }>;
}

const CourseDetailPage = async ({ params }: CourseDetailParams) => {
  const { courseId } = await params;
  const queryClient = new QueryClient();

  // Seed the course data during static generation / revalidation. This must
  // use Next's fetch with a revalidate window (a plain uncached request would
  // force the route to render dynamically and defeat ISR).
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(8000) },
    );
    if (response.ok) {
      queryClient.setQueryData(["course", courseId], await response.json());
    }
  } catch {
    // API unreachable during build/revalidation — the client fetches after
    // hydration instead of failing the build.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CourseDetail courseId={courseId} />
    </HydrationBoundary>
  );
};

export default CourseDetailPage;
