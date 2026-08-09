import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { EnrollmentController } from "./enrollment.controller";
import { checkoutZodSchema } from "./enrollment.validation";

const router = Router();

router.post(
  "/checkout",
  checkAuth(UserRole.STUDENT),
  validateRequest(checkoutZodSchema),
  EnrollmentController.checkoutCart,
);

router.get(
  "/my-enrollments",
  checkAuth(UserRole.STUDENT),
  EnrollmentController.getMyEnrollments,
);

router.get(
  "/my-enrollments/:id",
  checkAuth(UserRole.STUDENT),
  EnrollmentController.getSingleEnrollment,
);

router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  EnrollmentController.getAllEnrollments,
);

export const EnrollmentRoutes = router;
