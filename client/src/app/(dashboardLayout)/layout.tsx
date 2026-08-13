import DashboardShell from "@/components/modules/Dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/currentUser";

const RootDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const userInfo = await getCurrentUser();

  if (!userInfo) {
    return null;
  }

  return <DashboardShell userInfo={userInfo}>{children}</DashboardShell>;
};

export default RootDashboardLayout;
