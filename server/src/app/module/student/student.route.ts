import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { StudentController } from "./student.controller";
import { updateStudentProfileMiddleware } from "./student.middlewares";
import { updateStudentZodSchema } from "./student.validation";

const router = Router();

router.get(
  "/my-profile",
  checkAuth(UserRole.STUDENT),
  StudentController.getMyProfile,
);

router.patch(
  "/my-profile",
  checkAuth(UserRole.STUDENT),
  multerUpload.single("profilePhoto"),
  updateStudentProfileMiddleware,
  validateRequest(updateStudentZodSchema),
  StudentController.updateMyProfile,
);

router.delete(
  "/me",
  checkAuth(UserRole.STUDENT),
  StudentController.deleteMyAccount,
);

router.get(
  "/dashboard",
  checkAuth(UserRole.STUDENT),
  StudentController.getDashboardStats,
);

router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  StudentController.getAllStudents,
);

router.get(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  StudentController.getStudentById,
);

router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateStudentZodSchema),
  StudentController.updateStudent,
);

router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  StudentController.deleteStudent,
);

export const StudentRoutes = router;
