import { z } from "zod";

const addItemZodSchema = z.object({
  courseId: z.string("Course ID is required"),
});

export const WishlistValidation = {
  addItemZodSchema,
};
