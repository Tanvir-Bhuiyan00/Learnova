import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";
import React from "react";

const RootDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas-soft/40">
      {/* Dashboard Sidebar */}
      <DashboardSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* DashboardNavbar */}
        <DashboardNavbar />
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default RootDashboardLayout;
