import z from "zod";

export const updateInstructorZodSchema = z.object({
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
  bio: z.string("Bio must be string")
    .max(500, "Bio must be at most 500 characters")
    .optional(),
  qualification: z.string("Qualification must be string")
    .min(2, "Qualification must be at least 2 characters")
    .max(100, "Qualification must be at most 100 characters")
    .optional(),
  experience: z.number("Experience must be a number")
    .int("Experience must be an integer")
    .nonnegative("Experience cannot be negative")
    .optional(),
  currentWorkingPlace: z.string("Current working place must be string")
    .min(2, "Current working place must be at least 2 characters")
    .max(100, "Current working place must be at most 100 characters")
    .optional(),
  designation: z.string("Designation must be string")
    .min(2, "Designation must be at least 2 characters")
    .max(100, "Designation must be at most 100 characters")
    .optional(),
});
