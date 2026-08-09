import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { InstructorController } from "./instructor.controller";
import { updateInstructorZodSchema } from "./instructor.validation";

const router = Router();

router.get(
  "/",
  InstructorController.getAllInstructors,
);
router.get(
  "/:id",
  InstructorController.getInstructorById,
);
router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR),
  validateRequest(updateInstructorZodSchema),
  InstructorController.updateInstructor,
);
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  InstructorController.deleteInstructor,
);

export const InstructorRoutes = router;
