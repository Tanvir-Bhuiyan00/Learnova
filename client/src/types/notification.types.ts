export type NotificationType = "ENROLLMENT" | "REVIEW" | "SYSTEM" | "USER";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UnreadNotificationCount {
  unreadCount: number;
}
