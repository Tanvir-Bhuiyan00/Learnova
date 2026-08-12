"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { logoutAction } from "@/lib/authActions";
import { UserInfo } from "@/types/user.types";
import {
  ChevronRight,
  KeyRound,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

interface UserDropdownProps {
  userInfo: UserInfo;
}

const roleStyles: Record<string, string> = {
  ADMIN: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  SUPER_ADMIN: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  INSTRUCTOR: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  STUDENT: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
};

const UserDropdown = ({ userInfo }: UserDropdownProps) => {
  const initials = userInfo.name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleLabel = userInfo.role.toLowerCase().replace("_", " ");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary-pale p-0 shadow-sm ring-2 ring-white/40 transition-shadow hover:shadow-md dark:ring-black/30"
            aria-label="Account menu"
          >
            {userInfo.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userInfo.image}
                alt={userInfo.name}
                className="size-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm font-extrabold tracking-wide text-white">
                {initials}
              </span>
            )}
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-72 overflow-hidden rounded-2xl border border-foreground/5 bg-popover p-0 shadow-xl"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary-pale px-5 pb-5 pt-5">
          <div className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-4 size-24 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-3">
            {userInfo.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userInfo.image}
                alt={userInfo.name}
                className="size-12 rounded-full object-cover ring-2 ring-white/50"
              />
            ) : (
              <span className="flex size-12 items-center justify-center rounded-full bg-white/20 text-base font-extrabold text-white ring-2 ring-white/50 backdrop-blur-sm">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-bold text-white">
                {userInfo.name}
              </p>
              <p className="truncate text-xs text-white/80">{userInfo.email}</p>
            </div>
          </div>
          <span
            className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-bold capitalize backdrop-blur-sm ${
              roleStyles[userInfo.role] ?? "bg-white/15 text-white"
            }`}
          >
            <ShieldCheck className="size-3" />
            {roleLabel}
          </span>
        </div>

        <div className="p-2">
          <DropdownMenuItem className="group cursor-pointer px-1 py-1 focus:bg-transparent">
            <Link
              href={getDefaultDashboardRoute(userInfo.role)}
              className="flex w-full items-center rounded-lg px-2 py-2.5 transition-colors group-focus-within:bg-accent"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary-pale text-primary transition-colors group-hover:bg-primary/15">
                <LayoutDashboard className="size-4" />
              </span>
              <span className="ml-2.5 font-medium">Dashboard</span>
              <ChevronRight className="ml-auto size-4 opacity-40" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="group cursor-pointer px-1 py-1 focus:bg-transparent">
            <Link
              href="/my-profile"
              className="flex w-full items-center rounded-lg px-2 py-2.5 transition-colors group-focus-within:bg-accent"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 transition-colors group-hover:bg-sky-500/20 dark:text-sky-400">
                <UserRound className="size-4" />
              </span>
              <span className="ml-2.5 font-medium">My Profile</span>
              <ChevronRight className="ml-auto size-4 opacity-40" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="group cursor-pointer px-1 py-1 focus:bg-transparent">
            <Link
              href="/change-password"
              className="flex w-full items-center rounded-lg px-2 py-2.5 transition-colors group-focus-within:bg-accent"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-500/20 dark:text-amber-400">
                <KeyRound className="size-4" />
              </span>
              <span className="ml-2.5 font-medium">Change Password</span>
              <ChevronRight className="ml-auto size-4 opacity-40" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1.5 bg-foreground/10" />

          <DropdownMenuItem
            onClick={() => logoutAction()}
            variant="destructive"
            className="group cursor-pointer px-1 py-1 focus:bg-transparent"
          >
            <span className="flex w-full items-center rounded-lg px-2 py-2.5 transition-colors group-focus-within:bg-destructive/10">
              <span className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 transition-colors group-hover:bg-red-500/20 dark:text-red-400">
                <LogOut className="size-4" />
              </span>
              <span className="ml-2.5 font-medium">Logout</span>
            </span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
