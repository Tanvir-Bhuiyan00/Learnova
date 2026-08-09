import { z } from "zod";

export const updateStudentZodSchema = z.object({
  name: z.string().min(5).max(30).optional(),
  profilePhoto: z.string().optional(),
  contactNumber: z.string().min(11).max(14).optional(),
  address: z.string().min(10).max(100).optional(),
});
