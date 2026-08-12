import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { IQueryParams } from "../../interfaces/query.interface";
import { NotificationService } from "./notification.service";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await NotificationService.getMyNotifications(
    user,
    req.query as IQueryParams,
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await NotificationService.getUnreadCount(user);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Unread notification count retrieved successfully",
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id as string;
  const result = await NotificationService.markAsRead(user, id);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await NotificationService.markAllAsRead(user);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "All notifications marked as read",
    data: result,
  });
});

export const NotificationController = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
