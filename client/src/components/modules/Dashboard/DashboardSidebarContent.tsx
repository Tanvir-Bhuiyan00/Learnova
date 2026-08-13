"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "hidden h-full flex-col border-r border-canvas-soft bg-card transition-[width] duration-300 sm:flex",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center",
          collapsed ? "justify-center px-2" : "px-6",
        )}
      >
        <Link
          href={dashboardHome}
          className={cn("flex items-center gap-2", collapsed && "justify-center")}
        >
          <span className="size-3 shrink-0 rounded-full bg-primary" />
          {!collapsed && (
            <span className="font-heading text-xl font-extrabold tracking-tight text-ink">
              Learnova
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Area */}
      <ScrollArea className="min-h-0 flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navItems.map((section, sectionId) => (
            <div key={sectionId}>
              {section.title && !collapsed && (
                <h4 className="mb-2 px-3 text-[0.6875rem] font-bold uppercase tracking-widest text-mute-text">
                  {section.title}
                </h4>
              )}

              <div className="space-y-1">
                {section.items.map((item, id) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" &&
                      item.href !== "/admin/dashboard" &&
                      item.href !== "/instructor/dashboard" &&
                      pathname.startsWith(item.href));
                  const Icon = getIconComponent(item.icon);

                  return (
                    <Link
                      href={item.href}
                      key={id}
                      title={collapsed ? item.title : undefined}
                      className={cn(
                        "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        collapsed
                          ? "justify-center"
                          : "gap-3",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary-pale"
                          : "text-body-text hover:bg-canvas-soft hover:text-ink",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive && "text-primary-foreground",
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  );
                })}
              </div>

              {sectionId < navItems.length - 1 && (
                <Separator className="my-4 bg-canvas-soft" />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info At Bottom */}
      <div className="border-t border-canvas-soft p-4">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-pale text-xs font-extrabold text-ink-deep">
              {getInitials(userInfo.name) ||
                userInfo.name.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-pale text-xs font-extrabold text-ink-deep">
              {getInitials(userInfo.name) ||
                userInfo.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {userInfo.name}
              </p>
              <p className="truncate text-xs capitalize text-mute-text">
                {userInfo.role.toLowerCase().replace("_", " ")}
              </p>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "mt-4 flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-body-text transition-colors hover:bg-canvas-soft hover:text-ink",
            collapsed && "justify-center px-0",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <>
              <PanelLeftClose className="mr-3 size-4" />
              Collapse
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebarContent;