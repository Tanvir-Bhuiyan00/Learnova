import z from "zod";

export const updateStudentZodSchema = z.object({
  name: z.string("Name must be string")
    .min(5, "Name must be at least 5 characters")
    .max(30, "Name must be at most 30 characters")
    .optional(),
  profilePhoto: z.string("Profile photo must be a string").optional(),
  contactNumber: z.string("Contact number must be string")
    .min(11, "Contact number must be at least 11 characters")
    .max(14, "Contact number must be at most 14 characters")
    .optional(),
  address: z.string("Address must be string")
    .min(10, "Address must be at least 10 characters")
    .max(100, "Address must be at most 100 characters")
    .optional(),
});
