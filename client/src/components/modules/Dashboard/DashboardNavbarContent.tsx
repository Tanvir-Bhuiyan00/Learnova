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
    <div className="flex items-center gap-4 w-full px-4 py-3 border-b bg-background">
      {/* Mobile Menu Toggle Button And Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant={"outline"} size={"icon"} aria-label="Toggle menu" aria-expanded={isOpen}>
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-64 p-0">
          <DashboardMobileSidebar
            userInfo={userInfo}
            dashboardHome={dashboardHome}
            navItems={navItems}
          />
        </SheetContent>
      </Sheet>

      {/* Search Component */}
      <div className={cn("flex-1 flex flex-col gap-1 min-w-0", showMobileSearch && "sm:hidden")}>
        {/* Desktop Search - always visible on sm+ */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Search..." className="pl-9 pr-4" />
        </div>

        {/* Mobile Search - expandable */}
        <div className={cn("relative w-full sm:hidden", showMobileSearch ? "block" : "hidden")}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-10"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setShowMobileSearch(false)}
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
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
            className="sm:hidden"
            onClick={() => setShowMobileSearch(true)}
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </Button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification */}
        <NotificationDropdown />

        {/* User Dropdown  */}
        <UserDropdown userInfo={userInfo} />
      </div>
    </div>
  );
};

export default DashboardNavbarContent;
