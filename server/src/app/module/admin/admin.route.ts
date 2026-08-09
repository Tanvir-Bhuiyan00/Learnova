import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AdminController } from "./admin.controller";
import {
  changeUserRoleZodSchema,
  changeUserStatusZodSchema,
  updateAdminZodSchema,
} from "./admin.validation";

const router = Router();

router.patch(
  "/change-user-status",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(changeUserStatusZodSchema),
  AdminController.changeUserStatus,
);
router.patch(
  "/change-user-role",
  checkAuth(UserRole.SUPER_ADMIN),
  validateRequest(changeUserRoleZodSchema),
  AdminController.changeUserRole,
);

router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.getAllAdmins,
);
router.get(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.getAdminById,
);
router.patch(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN),
  validateRequest(updateAdminZodSchema),
  AdminController.updateAdmin,
);
router.delete(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN),
  AdminController.deleteAdmin,
);

export const AdminRoutes = router;
