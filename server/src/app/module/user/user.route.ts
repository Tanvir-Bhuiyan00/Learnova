import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserController } from "./user.controller";
import { createInstructorZodSchema } from "./user.validation";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
    "/create-instructor",

    checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),

    validateRequest(createInstructorZodSchema),

    UserController.createInstructor,
);

export const UserRoutes = router;
