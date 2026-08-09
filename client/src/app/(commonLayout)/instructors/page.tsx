import InstructorsList from "@/components/modules/Instructors/InstructorsList";
import { getInstructors } from "@/services/instructor.services";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const InstructorsPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["instructors"],
    queryFn: () => getInstructors(),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InstructorsList />
    </HydrationBoundary>
  );
};

export default InstructorsPage;
