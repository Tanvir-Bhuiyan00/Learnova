import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { getNavItemsByRole } from "@/lib/navItems";
import { getCurrentUser } from "@/lib/currentUser";
import { NavSection } from "@/types/dashboard.types";
import DashboardNavbarContent from "./DashboardNavbarContent";

const getTitle = (pathname: string): string => {
  const clean = pathname.replace(/^\//, "").replace(/\/$/, "");
  if (!clean) return "Dashboard";
  const segments = clean.split("/");
  const last = segments[segments.length - 1];
  if (last === "dashboard") return "Dashboard";
  return last
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
};

const DashboardNavbar = async () => {
  const userInfo = await getCurrentUser();

  if (!userInfo) {
    return null;
  }

  const navItems: NavSection[] = getNavItemsByRole(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  // Read pathname for the page title (server component reads headers)
  const { headers } = await import("next/headers");
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  return (
    <DashboardNavbarContent
      userInfo={userInfo}
      navItems={navItems}
      dashboardHome={dashboardHome}
      title={getTitle(pathname)}
    />
  );
};

export default DashboardNavbar;