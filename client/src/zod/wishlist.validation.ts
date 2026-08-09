import { z } from "zod";

export const addItemZodSchema = z.object({
  courseId: z.string(),
});
