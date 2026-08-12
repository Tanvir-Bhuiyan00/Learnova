import HomeHero from "@/components/modules/HomeHero";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

// Regenerate this static page at most once per minute.
export const revalidate = 60;

const HomePage = async () => {
  const queryClient = new QueryClient();

  // Seed the catalog data during static generation / revalidation. This must
  // use Next's fetch with a revalidate window (a plain uncached request would
  // force the route to render dynamically and defeat ISR).
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses?status=PUBLISHED&limit=100`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(8000) },
    );
    if (response.ok) {
      queryClient.setQueryData(["courses", "published"], await response.json());
    }
  } catch {
    // API unreachable during build/revalidation — the client fetches after
    // hydration instead of failing the build.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeHero />
    </HydrationBoundary>
  );
};

export default HomePage;
