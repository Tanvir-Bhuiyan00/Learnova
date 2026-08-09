import express from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { AssignmentController } from "./assignment.controller";
import { AssignmentValidation } from "./assignment.validation";

const router = express.Router();

router.post(
  "/",
  checkAuth(UserRole.INSTRUCTOR),
  validateRequest(AssignmentValidation.createAssignmentZodSchema),
  AssignmentController.createAssignment,
);

router.get("/", AssignmentController.getAllAssignments);

router.get("/:id", AssignmentController.getAssignmentById);

router.patch(
  "/:id",
  checkAuth(UserRole.INSTRUCTOR),
  validateRequest(AssignmentValidation.updateAssignmentZodSchema),
  AssignmentController.updateAssignment,
);

router.delete(
  "/:id",
  checkAuth(UserRole.INSTRUCTOR),
  AssignmentController.deleteAssignment,
);

router.post(
  "/:id/submit",
  checkAuth(UserRole.STUDENT),
  multerUpload.single("file"),
  AssignmentController.submitAssignment,
);

router.get(
  "/:id/submissions",
  checkAuth(UserRole.INSTRUCTOR),
  AssignmentController.getSubmissions,
);

router.patch(
  "/submissions/:submissionId/grade",
  checkAuth(UserRole.INSTRUCTOR),
  validateRequest(AssignmentValidation.gradeSubmissionZodSchema),
  AssignmentController.gradeSubmission,
);

export const AssignmentRoutes = router;
