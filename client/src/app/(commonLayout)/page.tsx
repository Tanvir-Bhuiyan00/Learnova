import HomeHero from "@/components/modules/HomeHero";
import { getCourses } from "@/services/course.services";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

const HomePage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["courses", "published"],
    queryFn: () => getCourses("status=PUBLISHED&limit=100"),
    staleTime: 60 * 1000,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeHero />
    </HydrationBoundary>
  );
};

export default HomePage;
