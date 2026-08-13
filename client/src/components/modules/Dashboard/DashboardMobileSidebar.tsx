"use client";

import { SheetTitle } from "@/components/ui/sheet";
import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { logoutAction } from "@/lib/authActions";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";
import Link from "next/link";
import SidebarNav from "./SidebarNav";

interface DashboardMobileSidebarProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
}

const DashboardMobileSidebar = ({
  dashboardHome,
  navItems,
  userInfo,
}: DashboardMobileSidebarProps) => {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-card">
      {/* Logo / Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6">
        <Link href={dashboardHome} className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white">
            L
          </span>
          <span className="font-heading text-lg font-extrabold tracking-tight text-ink">
            Learnova
          </span>
        </Link>
      </div>

      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

      {/* Navigation Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav navItems={navItems} />
      </div>

      {/* User Info */}
      <div className="border-t border-canvas-soft p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-pale text-xs font-extrabold text-ink-deep">
            {userInfo.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join("") || "U"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{userInfo.name}</p>
            <p className="truncate text-xs capitalize text-mute-text">
              {userInfo.role.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMobileSidebar;