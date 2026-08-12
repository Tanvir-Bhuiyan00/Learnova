"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import UserDropdown from "@/components/modules/Dashboard/UserDropdown";
import { UserInfo } from "@/types/user.types";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/instructors", label: "Instructors" },
  { href: "/categories", label: "Categories" },
];

const PublicHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const router = useRouter();

  // The public layout is statically rendered, so the header resolves the
  // logged-in user client-side via the same-origin /api/me route (httpOnly
  // cookies never leave the server).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data: { user?: UserInfo | null }) => {
        if (!cancelled) setUserInfo(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUserInfo(null);
      })
      .finally(() => {
        if (!cancelled) setUserLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const authArea = !userLoaded ? (
    <div className="h-9 w-24 animate-pulse rounded-full bg-canvas-soft" />
  ) : userInfo ? (
    <UserDropdown userInfo={userInfo} />
  ) : (
    <>
      <Link href="/login">
        <Button variant="ghost" size="sm">
          Log In
        </Button>
      </Link>
      <Link href="/register">
        <Button size="sm">Sign Up</Button>
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-canvas-soft bg-card/90 backdrop-blur-xl supports-[backdrop-filter]:bg-card/75">
      <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="size-3 rounded-full bg-primary transition-transform group-hover:scale-125" />
          <span className="font-heading text-2xl font-extrabold tracking-tight text-ink">
            Learnova
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.9375rem] font-medium text-body-text transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/about"
            className="text-[0.9375rem] font-medium text-body-text transition-colors hover:text-ink"
          >
            About
          </Link>
        </nav>

        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute-text" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-60 rounded-full border-border bg-canvas-soft/70 pl-10 transition-colors focus-visible:bg-card lg:w-72"
          />
        </form>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {authArea}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="border-t border-canvas-soft md:hidden">
          <div className="container mx-auto space-y-2 px-4 py-4">
            <form onSubmit={handleSearch} className="relative pb-2">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute-text" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border-border bg-canvas-soft/70 pl-10 focus-visible:bg-card"
              />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-medium text-body-text transition-colors hover:text-ink"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/about"
              className="block py-2 text-sm font-medium text-body-text transition-colors hover:text-ink"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
            <div className="flex items-center gap-2 border-t border-canvas-soft pt-3">
              <ThemeToggle />
              {!userLoaded ? (
                <div className="h-9 w-full animate-pulse rounded-full bg-canvas-soft" />
              ) : userInfo ? (
                <UserDropdown userInfo={userInfo} />
              ) : (
                <>
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button className="w-full" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
