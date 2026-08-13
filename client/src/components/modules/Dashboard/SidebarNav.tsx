"use client";

import { logoutAction } from "@/lib/authActions";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";
import { HelpCircle, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarNavProps {
  navItems: NavSection[];
}

export function SidebarNav({ navItems }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="space-y-5">
      {navItems.map((section, sectionId) => (
        <div key={sectionId}>
          {section.title && (
            <p className="mb-1.5 px-3 text-[0.6875rem] font-bold uppercase tracking-widest text-mute-text">
              {section.title}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(item.href);
              const Icon = getIconComponent(item.icon);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-muted-foreground hover:bg-canvas-soft hover:text-ink",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px] shrink-0 transition-colors",
                      active
                        ? "text-indigo-600"
                        : "text-mute-text group-hover:text-ink",
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                  {active && (
                    <span className="ml-auto size-2 rounded-full bg-indigo-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <div className="border-t border-canvas-soft pt-3">
        <Link
          href="/faq"
          className="flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-canvas-soft hover:text-ink"
        >
          <HelpCircle className="size-[18px] text-mute-text" />
          FAQ
        </Link>
        <button
          onClick={() => logoutAction()}
          className="flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-canvas-soft hover:text-negative"
        >
          <LogOut className="size-[18px] text-mute-text" />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default SidebarNav;
