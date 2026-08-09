import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CourseController } from "./course.controller";
import {
  createCourseZodSchema,
  createLessonZodSchema,
  createModuleZodSchema,
  updateCourseZodSchema,
  updateLessonZodSchema,
  updateModuleZodSchema,
} from "./course.validation";

const router = Router();

router.post(
  "/",
  checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(createCourseZodSchema),
  CourseController.createCourse,
);
router.get("/", CourseController.getAllCourses);
router.get("/:id", CourseController.getCourseById);
router.patch(
  "/:id",
  checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateCourseZodSchema),
  CourseController.updateCourse,
);
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CourseController.deleteCourse,
);

router.post(
  "/:courseId/modules",
  checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(createModuleZodSchema),
  CourseController.createModule,
);
router.get("/:courseId/modules", CourseController.getModulesByCourse);
router.patch(
  "/:courseId/modules/:id",
  checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateModuleZodSchema),
  CourseController.updateModule,
);
router.delete(
  "/:courseId/modules/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CourseController.deleteModule,
);

router.post(
  "/:courseId/modules/:moduleId/lessons",
  checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(createLessonZodSchema),
  CourseController.createLesson,
);
router.get(
  "/:courseId/modules/:moduleId/lessons",
  CourseController.getLessonsByModule,
);
router.patch(
  "/:courseId/modules/:moduleId/lessons/:id",
  checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateLessonZodSchema),
  CourseController.updateLesson,
);
router.delete(
  "/:courseId/modules/:moduleId/lessons/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CourseController.deleteLesson,
);

export const CourseRoutes = router;
