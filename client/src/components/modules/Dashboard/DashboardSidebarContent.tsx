"use client";

import { cn } from "@/lib/utils";
import Logo from "@/components/shared/Logo";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";
import { useState } from "react";
import SidebarNav from "./SidebarNav";

interface DashboardSidebarContentProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const DashboardSidebarContent = ({
  dashboardHome,
  navItems,
  userInfo,
}: DashboardSidebarContentProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "hidden h-full flex-col border-r border-canvas-soft bg-card transition-[width] duration-300 sm:flex",
        collapsed ? "w-[4.75rem]" : "w-60",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-canvas-soft",
          collapsed ? "justify-center px-2" : "px-6",
        )}
      >
        <Logo
          href={dashboardHome}
          showWordmark={!collapsed}
          compact
          className={cn(collapsed && "justify-center")}
        />
      </div>

      {/* Navigation */}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto py-4",
          collapsed ? "px-2" : "px-3",
        )}
      >
        <SidebarNav navItems={navItems} />
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-canvas-soft p-3">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "flex w-full items-center gap-3 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-canvas-soft hover:text-ink",
            collapsed && "justify-center px-0",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <span className="flex size-7 items-center justify-center rounded-full bg-canvas-soft text-mute-text">
              {getInitials(userInfo.name) || "U"}
            </span>
          ) : (
            <>
              <span className="flex size-7 items-center justify-center rounded-full bg-primary-pale text-xs font-extrabold text-ink-deep">
                {getInitials(userInfo.name) || "U"}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-semibold text-ink">
                  {userInfo.name}
                </span>
                <span className="block truncate text-xs capitalize text-mute-text">
                  {userInfo.role.toLowerCase().replace("_", " ")}
                </span>
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebarContent;