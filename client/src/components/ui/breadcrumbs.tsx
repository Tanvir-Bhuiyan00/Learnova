"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  admin: "Admin",
  instructor: "Instructor",
  courses: "Courses",
  create: "Create",
  edit: "Edit",
  curriculum: "Curriculum",
  quizzes: "Quizzes",
  assignments: "Assignments",
  submissions: "Submissions",
  reviews: "Reviews",
  discussions: "Discussions",
  "my-learning": "My Learning",
  "my-cart": "My Cart",
  "my-certificates": "My Certificates",
  "my-reviews": "My Reviews",
  wishlist: "Wishlist",
  checkout: "Checkout",
  "payment-history": "Payment History",
  "users-management": "Users",
  "categories-management": "Categories",
  "courses-management": "Courses",
  "enrollments-management": "Enrollments",
  "discussions-management": "Discussions",
  "payments-management": "Payments",
  "reviews-management": "Reviews",
  "students-management": "Students",
  "instructors-management": "Instructors",
  "admins-management": "Admins",
  "my-profile": "My Profile",
  "change-password": "Change Password",
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    ...segments.map((seg, i) => {
      const href = "/" + segments.slice(0, i + 1).join("/");
      const label = routeLabels[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return { label: label.length > 30 ? label.slice(0, 30) + "..." : label, href };
    }),
  ];

  return (
    <nav className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3.5" />}
          {i < items.length - 1 ? (
            <Link href={item.href!} className="hover:text-foreground transition-colors">{i === 0 ? <Home className="size-3.5" /> : item.label}</Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
