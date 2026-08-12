import CoursesList from "@/components/modules/Courses/CoursesList";
import { getCategories } from "@/services/category.services";
import { getCourses } from "@/services/course.services";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

// Regenerate this static page at most once per minute.
export const revalidate = 60;

interface CoursesSearchParams {
  searchParams: Promise<{ q?: string; category?: string }>;
}

const CoursesPage = async ({ searchParams }: CoursesSearchParams) => {
  const { q = "", category = "" } = await searchParams;
  const queryClient = new QueryClient();

  const params = new URLSearchParams("page=1&limit=6&status=PUBLISHED");
  if (q.trim()) params.set("searchTerm", q.trim());
  if (category.trim()) params.set("categoryId", category.trim());

  // Non-fatal: on static generation (ISR) the API may be unreachable, in
  // which case the client fetches after hydration instead of failing the build.
  await queryClient
    .prefetchQuery({
      queryKey: ["courses", q, category || "all", "all", "newest", false, 1],
      queryFn: () => getCourses(params.toString()),
      staleTime: 60 * 1000,
    })
    .catch(() => {});

  await queryClient
    .prefetchQuery({
      queryKey: ["categories"],
      queryFn: () => getCategories(),
      staleTime: 60 * 1000,
    })
    .catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CoursesList initialCategory={category || "all"} />
    </HydrationBoundary>
  );
};

export default CoursesPage;
