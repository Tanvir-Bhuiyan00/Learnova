"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import DashboardMobileSidebar from "./DashboardMobileSidebar";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";
import { cn } from "@/lib/utils";

interface DashboardNavbarProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string;
}

const DashboardNavbarContent = ({
  dashboardHome,
  navItems,
  userInfo,
}: DashboardNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <div className="flex w-full items-center gap-4 border-b border-canvas-soft bg-card px-4 py-3 md:px-6">
      {/* Mobile Menu Toggle Button And Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="sm:hidden">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <Menu className="size-5" />
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

      {/* Search Component */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-1",
          showMobileSearch && "sm:hidden",
        )}
      >
        {/* Desktop Search - always visible on sm+ */}
        <div className="relative hidden w-full sm:block">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute-text" />
          <Input
            type="text"
            placeholder="Search..."
            className="rounded-full border-border bg-canvas-soft/70 pl-10 focus-visible:bg-card"
          />
        </div>

        {/* Mobile Search - expandable */}
        <div
          className={cn(
            "relative w-full sm:hidden",
            showMobileSearch ? "block" : "hidden",
          )}
        >
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute-text" />
          <Input
            type="text"
            placeholder="Search..."
            className="rounded-full border-border bg-canvas-soft/70 pl-10 pr-10 focus-visible:bg-card"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 size-7 -translate-y-1/2 rounded-full"
            onClick={() => setShowMobileSearch(false)}
            aria-label="Close search"
          >
            <X className="size-4" />
          </Button>
        </div>

        <Breadcrumbs className="hidden sm:flex" />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Mobile Search Toggle */}
        {!showMobileSearch && (
          <Button
            variant="outline"
            size="icon"
            className="rounded-full sm:hidden"
            onClick={() => setShowMobileSearch(true)}
            aria-label="Open search"
          >
            <Search className="size-5" />
          </Button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification */}
        <NotificationDropdown />

        {/* User Dropdown */}
        <UserDropdown userInfo={userInfo} />
      </div>
    </div>
  );
};

export default DashboardNavbarContent;
