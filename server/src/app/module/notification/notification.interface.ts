import { NotificationType } from "../../../generated/prisma/enums";

export interface IUserContext {
  userId: string;
  role: string;
  email: string;
}

export interface ICreateNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}
