"use client";

import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { getNavItemsByRole } from "@/lib/navItems";
import { UserInfo } from "@/types/user.types";
import React from "react";
import DashboardNavbarContent from "@/components/modules/Dashboard/DashboardNavbarContent";
import DashboardSidebarContent from "@/components/modules/Dashboard/DashboardSidebarContent";

interface DashboardShellProps {
  userInfo: UserInfo;
  children: React.ReactNode;
  title?: string;
  rightPanel?: React.ReactNode;
}

/**
 * Shared shell for every role dashboard: fixed sidebar + topbar + scrollable
 * main content + optional right panel (collapses below xl).
 */
const DashboardShell = ({
  userInfo,
  children,
  title,
  rightPanel,
}: DashboardShellProps) => {
  const navItems = getNavItemsByRole(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas-soft/40 supports-[height:100dvh]:h-dvh">
      {/* Sidebar */}
      <DashboardSidebarContent
        userInfo={userInfo}
        navItems={navItems}
        dashboardHome={dashboardHome}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <DashboardNavbarContent
          userInfo={userInfo}
          navItems={navItems}
          dashboardHome={dashboardHome}
          title={title}
        />

        {/* Main + optional right panel */}
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
          {rightPanel && (
            <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-canvas-soft bg-canvas-soft/20 p-4 xl:block">
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;