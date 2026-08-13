import AdminsManagementContent from "@/components/modules/Admin/AdminsManagement/AdminsManagementContent";
import { getCurrentUser } from "@/lib/currentUser";

const AdminsManagementPage = async () => {
  const userInfo = await getCurrentUser();

  return <AdminsManagementContent isSuperAdmin={userInfo?.role === "SUPER_ADMIN"} />;
};

export default AdminsManagementPage;
