import UsersManagementContent from "@/components/modules/Admin/UsersManagement/UsersManagementContent";
import { getCurrentUser } from "@/lib/currentUser";

const UsersManagementPage = async () => {
  const userInfo = await getCurrentUser();

  return <UsersManagementContent isSuperAdmin={userInfo?.role === "SUPER_ADMIN"} />;
};

export default UsersManagementPage;
