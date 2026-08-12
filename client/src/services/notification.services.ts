"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  Notification,
  UnreadNotificationCount,
} from "@/types/notification.types";

export const getMyNotifications = async (queryString?: string) => {
  try {
    const notifications = await httpClient.get<Notification[]>(
      `/notifications${queryString ? `?${queryString}` : "?limit=20"}`,
    );
    return notifications;
  } catch (error) {
    console.log("Error fetching notifications:", error);
    throw error;
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const result = await httpClient.get<UnreadNotificationCount>(
      "/notifications/unread-count",
    );
    return result;
  } catch (error) {
    console.log("Error fetching unread notification count:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    const result = await httpClient.patch<Notification>(
      `/notifications/${id}/read`,
      {},
    );
    return result;
  } catch (error) {
    console.log("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const result = await httpClient.patch<null>("/notifications/read-all", {});
    return result;
  } catch (error) {
    console.log("Error marking all notifications as read:", error);
    throw error;
  }
};
