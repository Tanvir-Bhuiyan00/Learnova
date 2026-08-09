import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { UserController } from "./user.controller";
import { createInstructorZodSchema } from "./user.validation";

const router = Router();

router.post(
    "/create-instructor",

    validateRequest(createInstructorZodSchema),

    UserController.createInstructor,
);

export const UserRoutes = router;
