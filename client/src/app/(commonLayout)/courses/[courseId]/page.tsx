import CourseDetail from "@/components/modules/Courses/CourseDetail";

interface CourseDetailParams {
  params: Promise<{ courseId: string }>;
}

const CourseDetailPage = async ({ params }: CourseDetailParams) => {
  const { courseId } = await params;
  return <CourseDetail courseId={courseId} />;
};

export default CourseDetailPage;
