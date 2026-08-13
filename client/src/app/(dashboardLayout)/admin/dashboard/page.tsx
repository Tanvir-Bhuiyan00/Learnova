import AdminDashboardContent from "@/components/modules/Dashboard/AdminDashboardContent";
import { MiniCalendar } from "@/components/shared/MiniCalendar";
import { UpcomingList } from "@/components/shared/UpcomingList";
import { getDashboardData } from "@/services/dashboard.services";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const AdminDashboardPage = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["admin-dashboard-data"],
    queryFn: getDashboardData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const rightPanel = (
    <div className="space-y-4">
      <MiniCalendar />
      <UpcomingList
        items={[
          {
            id: "r1",
            type: "event",
            title: "New platform milestone",
            date: "2026-08-20T00:00:00.000Z",
          },
          {
            id: "r2",
            type: "assignment",
            title: "Instructor application review",
            date: "2026-08-21T00:00:00.000Z",
          },
        ]}
      />
    </div>
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <AdminDashboardContent />
        <aside className="hidden xl:block">
          <div className="sticky top-0 space-y-4">{rightPanel}</div>
        </aside>
      </div>
    </HydrationBoundary>
  );
};

export default AdminDashboardPage;