import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { NotificationController } from "./notification.controller";

const router = express.Router();

router.get("/unread-count", checkAuth(), NotificationController.getUnreadCount);

router.get("/", checkAuth(), NotificationController.getMyNotifications);

router.patch(
  "/read-all",
  checkAuth(),
  NotificationController.markAllAsRead,
);

router.patch(
  "/:id/read",
  checkAuth(),
  NotificationController.markAsRead,
);

export const NotificationRoutes = router;
