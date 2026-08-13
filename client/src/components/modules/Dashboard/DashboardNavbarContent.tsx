"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";
import { Menu, MessageCircle, Search } from "lucide-react";
import { useState } from "react";
import DashboardMobileSidebar from "./DashboardMobileSidebar";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";

interface DashboardNavbarProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
  title?: string;
}

const DashboardNavbarContent = ({
  dashboardHome,
  navItems,
  userInfo,
  title,
}: DashboardNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-canvas-soft bg-card px-4 md:px-6">
      {/* Mobile Menu Toggle */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="sm:hidden">
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <DashboardMobileSidebar
            userInfo={userInfo}
            dashboardHome={dashboardHome}
            navItems={navItems}
          />
        </SheetContent>
      </Sheet>

      {/* Page Title */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-heading text-lg font-extrabold text-ink md:text-xl">
          {title ?? "Dashboard"}
        </h1>
      </div>

      {/* Centered Search */}
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute-text" />
        <input
          type="text"
          placeholder="Search here..."
          className="w-full rounded-full border border-border bg-canvas-soft/60 py-2 pl-10 pr-4 text-sm text-ink outline-none transition-all placeholder:text-mute-text focus:border-primary focus:bg-card"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="relative size-9 rounded-full"
          aria-label="Messages"
        >
          <MessageCircle className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-indigo-500 ring-2 ring-card" />
        </Button>
        <div className="relative md:hidden">
          <Search className="size-4 text-mute-text" />
        </div>
        <ThemeToggle />
        <NotificationDropdown />
        <UserDropdown userInfo={userInfo} />
      </div>
    </div>
  );
};

export default DashboardNavbarContent;