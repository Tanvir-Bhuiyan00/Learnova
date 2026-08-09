import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import z from "zod";

export const updateAdminZodSchema = z.object({
  name: z.string().optional(),
  profilePhoto: z.string().optional(),
  contactNumber: z.string().min(11).max(14).optional(),
  address: z.string().optional(),
});

export const changeUserStatusZodSchema = z.object({
  userId: z.string(),
  userStatus: z.nativeEnum(UserStatus),
});

export const changeUserRoleZodSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(UserRole),
});
