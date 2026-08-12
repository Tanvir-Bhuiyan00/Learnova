import CoursesList from "@/components/modules/Courses/CoursesList";
import { getCategories } from "@/services/category.services";
import { getCourses } from "@/services/course.services";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

interface CoursesSearchParams {
  searchParams: Promise<{ q?: string }>;
}

const CoursesPage = async ({ searchParams }: CoursesSearchParams) => {
  const { q = "" } = await searchParams;
  const queryClient = new QueryClient();

  const params = new URLSearchParams("page=1&limit=6&status=PUBLISHED");
  if (q.trim()) params.set("searchTerm", q.trim());

  await queryClient.prefetchQuery({
    queryKey: ["courses", q, "all", "all", "newest", false, 1],
    queryFn: () => getCourses(params.toString()),
    staleTime: 60 * 1000,
  });

  await queryClient.prefetchQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CoursesList />
    </HydrationBoundary>
  );
};

export default CoursesPage;
