import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthController } from "./auth.controller";
import {
  changePasswordZodSchema,
  forgetPasswordZodSchema,
  loginUserZodSchema,
  registerStudentZodSchema,
  resetPasswordZodSchema,
  verifyEmailZodSchema,
} from "./auth.validation";

const router = Router();

router.post("/register", validateRequest(registerStudentZodSchema), AuthController.registerStudent);
router.post("/login", validateRequest(loginUserZodSchema), AuthController.loginUser);
router.get(
  "/me",
  checkAuth(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT, UserRole.SUPER_ADMIN),
  AuthController.getMe,
);
router.post("/refresh-token", AuthController.getNewToken);
router.post(
  "/change-password",
  checkAuth(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT, UserRole.SUPER_ADMIN),
  validateRequest(changePasswordZodSchema),
  AuthController.changePassword,
);
router.post(
  "/logout",
  checkAuth(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT, UserRole.SUPER_ADMIN),
  AuthController.logoutUser,
);
router.post("/verify-email", validateRequest(verifyEmailZodSchema), AuthController.verifyEmail);
router.post("/forget-password", validateRequest(forgetPasswordZodSchema), AuthController.forgetPassword);
router.post("/reset-password", validateRequest(resetPasswordZodSchema), AuthController.resetPassword);

router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);

export const AuthRoutes = router;
