import InstructorDetail from "@/components/modules/Instructors/InstructorDetail";
import { getInstructorById } from "@/services/instructor.services";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const InstructorDetailPage = async ({
  params,
}: {
  params: Promise<{ instructorId: string }>;
}) => {
  const { instructorId } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["instructor", instructorId],
    queryFn: () => getInstructorById(instructorId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InstructorDetail instructorId={instructorId} />
    </HydrationBoundary>
  );
};

export default InstructorDetailPage;
