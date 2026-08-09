import express from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { DiscussionController } from "./discussion.controller";
import { DiscussionValidation } from "./discussion.validation";

const router = express.Router();

router.get("/", DiscussionController.getAllDiscussions);

router.post(
  "/",
  checkAuth(UserRole.STUDENT),
  validateRequest(DiscussionValidation.createDiscussionZodSchema),
  DiscussionController.createDiscussion,
);

router.get("/:id", DiscussionController.getDiscussionById);

router.patch(
  "/:id",
  checkAuth(UserRole.STUDENT),
  validateRequest(DiscussionValidation.updateDiscussionZodSchema),
  DiscussionController.updateDiscussion,
);

router.delete(
  "/:id",
  checkAuth(UserRole.STUDENT),
  DiscussionController.deleteDiscussion,
);

router.patch(
  "/:id/pin",
  checkAuth(UserRole.INSTRUCTOR),
  DiscussionController.togglePinDiscussion,
);

router.patch(
  "/:id/resolve",
  checkAuth(UserRole.STUDENT, UserRole.INSTRUCTOR),
  DiscussionController.toggleResolveDiscussion,
);

router.post(
  "/:discussionId/replies",
  checkAuth(UserRole.STUDENT, UserRole.INSTRUCTOR),
  validateRequest(DiscussionValidation.createReplyZodSchema),
  DiscussionController.createReply,
);

router.delete(
  "/replies/:replyId",
  checkAuth(UserRole.STUDENT, UserRole.INSTRUCTOR),
  DiscussionController.deleteReply,
);

export const DiscussionRoutes = router;
