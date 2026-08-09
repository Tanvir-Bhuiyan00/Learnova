import { getDefaultDashboardRoute } from "@/lib/authUtils";

import { getCurrentUser } from "@/lib/currentUser";
import { NavSection } from "@/types/dashboard.types";
import DashboardSidebarContent from "./DashboardSidebarContent";
import { getNavItemsByRole } from "@/lib/navItems";

const DashboardSidebar = async () => {
  const userInfo = await getCurrentUser();

  if (!userInfo) {
    return null;
  }

  const navItems: NavSection[] = getNavItemsByRole(userInfo.role);

  const dashboardHome = getDefaultDashboardRoute(userInfo.role);
  return (
    <DashboardSidebarContent
      userInfo={userInfo}
      navItems={navItems}
      dashboardHome={dashboardHome}
    />
  );
};

export default DashboardSidebar;
