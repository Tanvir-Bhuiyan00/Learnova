"use client";

import InstructorDashboardContent from "@/components/modules/Dashboard/InstructorDashboardContent";
import { MiniCalendar } from "@/components/shared/MiniCalendar";
import { UpcomingList } from "@/components/shared/UpcomingList";

const InstructorDashboardPage = () => {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <InstructorDashboardContent />
      <aside className="hidden xl:block">
        <div className="sticky top-0 space-y-4">
          <MiniCalendar />
          <UpcomingList
            items={[
              {
                id: "a1",
                type: "assignment",
                title: "Grade: REST API assignment",
                date: "2026-08-19T00:00:00.000Z",
              },
              {
                id: "e1",
                type: "event",
                title: "Live Q&A session",
                date: "2026-08-22T00:00:00.000Z",
              },
            ]}
          />
        </div>
      </aside>
    </div>
  );
};

export default InstructorDashboardPage;