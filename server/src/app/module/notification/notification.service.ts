import { IQueryParams } from "../../interfaces/query.interface";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { sendResponse } from "../../shared/sendResponse";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateNotificationPayload, IUserContext } from "./notification.interface";

const createNotification = async (payload: ICreateNotificationPayload) => {
  return prisma.notification.create({
    data: {
      userId: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
    },
  });
};

const createManyNotifications = async (payloads: ICreateNotificationPayload[]) => {
  if (payloads.length === 0) return [];
  return prisma.notification.createMany({
    data: payloads.map((p) => ({
      userId: p.userId,
      title: p.title,
      message: p.message,
      type: p.type,
    })),
  });
};

const getMyNotifications = async (user: IUserContext, query: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.notification, query, {
    searchableFields: ["title", "message"],
    filterableFields: ["type", "isRead"],
  });

  return queryBuilder
    .search()
    .filter()
    .where({
      userId: user.userId,
    })
    .sort()
    .paginate()
    .execute();
};

const getUnreadCount = async (user: IUserContext) => {
  const count = await prisma.notification.count({
    where: { userId: user.userId, isRead: false },
  });
  return { unreadCount: count };
};

const markAsRead = async (user: IUserContext, id: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId: user.userId },
  });

  if (!notification) {
    throw new AppError(404, "Notification not found");
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

const markAllAsRead = async (user: IUserContext) => {
  return prisma.notification.updateMany({
    where: { userId: user.userId, isRead: false },
    data: { isRead: true },
  });
};

export const NotificationService = {
  createNotification,
  createManyNotifications,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
