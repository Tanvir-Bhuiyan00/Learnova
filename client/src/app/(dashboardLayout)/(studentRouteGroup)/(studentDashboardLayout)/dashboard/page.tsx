"use client";

import StudentDashboardContent from "@/components/modules/Dashboard/StudentDashboardContent";
import { MiniCalendar } from "@/components/shared/MiniCalendar";
import { UpcomingList } from "@/components/shared/UpcomingList";

const StudentDashboardPage = () => {
  const rightPanel = (
    <div className="space-y-4">
      <MiniCalendar />
      <UpcomingList
        items={[
          {
            id: "a1",
            type: "assignment",
            title: "Build a REST API",
            date: "2026-08-19T00:00:00.000Z",
          },
          {
            id: "t1",
            type: "test",
            title: "JavaScript Quiz",
            date: "2026-08-20T00:00:00.000Z",
          },
          {
            id: "l1",
            type: "lesson",
            title: "React Hooks Deep Dive",
            date: "2026-08-18T00:00:00.000Z",
          },
        ]}
      />
    </div>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <StudentDashboardContent />
      <aside className="hidden xl:block">
        <div className="sticky top-0 space-y-4">{rightPanel}</div>
      </aside>
    </div>
  );
};

export default StudentDashboardPage;