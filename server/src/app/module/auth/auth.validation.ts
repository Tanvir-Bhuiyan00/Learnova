import z from "zod";

export const registerStudentZodSchema = z.object({
  name: z.string("Name is required"),
  email: z.string("Email is required").email("Invalid email format"),
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const loginUserZodSchema = z.object({
  email: z.string("Email is required").email("Invalid email format"),
  password: z.string("Password is required"),
});

export const changePasswordZodSchema = z.object({
  currentPassword: z.string("Current password is required"),
  newPassword: z
    .string("New password is required")
    .min(6, "New password must be at least 6 characters"),
});

export const verifyEmailZodSchema = z.object({
  email: z.string("Email is required").email("Invalid email format"),
  otp: z.string("OTP is required"),
});

export const forgetPasswordZodSchema = z.object({
  email: z.string("Email is required").email("Invalid email format"),
});

export const resetPasswordZodSchema = z.object({
  email: z.string("Email is required").email("Invalid email format"),
  otp: z.string("OTP is required"),
  newPassword: z
    .string("New password is required")
    .min(6, "New password must be at least 6 characters"),
});
