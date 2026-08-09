import express from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router = express.Router();

router.get("/", ReviewController.getAllReviews);

router.post(
  "/",
  checkAuth(UserRole.STUDENT),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.giveReview,
);

router.get(
  "/my-reviews",
  checkAuth(UserRole.STUDENT, UserRole.INSTRUCTOR),
  ReviewController.myReviews,
);

router.patch(
  "/:id",
  checkAuth(UserRole.STUDENT),
  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateReview,
);

router.delete(
  "/:id",
  checkAuth(UserRole.STUDENT),
  ReviewController.deleteReview,
);

export const ReviewRoutes = router;
