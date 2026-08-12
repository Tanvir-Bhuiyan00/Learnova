import CourseDetail from "@/components/modules/Courses/CourseDetail";
import { getCourseById } from "@/services/course.services";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

interface CourseDetailParams {
  params: Promise<{ courseId: string }>;
}

const CourseDetailPage = async ({ params }: CourseDetailParams) => {
  const { courseId } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
    staleTime: 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CourseDetail courseId={courseId} />
    </HydrationBoundary>
  );
};

export default CourseDetailPage;