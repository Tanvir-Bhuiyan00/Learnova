"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SheetTitle } from "@/components/ui/sheet";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardMobileSidebarProps {
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

const DashboardMobileSidebar = ({
  dashboardHome,
  navItems,
  userInfo,
}: DashboardMobileSidebarProps) => {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-card">
      {/* Logo / Brand */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href={dashboardHome} className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-primary" />
          <span className="font-heading text-xl font-extrabold tracking-tight text-ink">
            Learnova
          </span>
        </Link>
      </div>

      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

      {/* Navigation Area */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navItems.map((section, sectionId) => (
            <div key={sectionId}>
              {section.title && (
                <h4 className="mb-2 px-3 text-[0.6875rem] font-bold uppercase tracking-widest text-mute-text">
                  {section.title}
                </h4>
              )}

              <div className="space-y-1">
                {section.items.map((item, id) => {
                  const isActive = pathname === item.href;
                  const Icon = getIconComponent(item.icon);

                  return (
                    <Link
                      href={item.href}
                      key={id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-ink shadow-sm shadow-primary-pale"
                          : "text-body-text hover:bg-canvas-soft hover:text-ink",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", isActive && "text-ink-deep")} />
                      <span className="flex-1">{item.title}</span>
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

      {/* User Info */}
      <div className="border-t border-canvas-soft p-4">
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
      </div>
    </div>
  );
};

export default DashboardMobileSidebar;
