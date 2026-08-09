import z from "zod";

export const createInstructorZodSchema = z.object({
    password: z
        .string("Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(20, "Password must be at most 20 characters"),
    instructor: z.object({
        name: z
            .string("Name is required and must be string")
            .min(5, "Name must be at least 5 characters")
            .max(30, "Name must be at most 30 characters"),

        email: z.string("Email is required").email("Invalid email address"),

        contactNumber: z
            .string("Contact number is required")
            .min(11, "Contact number must be at least 11 characters")
            .max(14, "Contact number must be at most 15 characters")
            .optional(),

        address: z
            .string("Address is required")
            .min(10, "Address must be at least 10 characters")
            .max(100, "Address must be at most 100 characters")
            .optional(),

        profilePhoto: z.string("Profile photo must be a string").optional(),

        bio: z
            .string("Bio is required")
            .min(10, "Bio must be at least 10 characters")
            .optional(),

        qualification: z
            .string("Qualification is required")
            .min(2, "Qualification must be at least 2 characters")
            .max(50, "Qualification must be at most 50 characters"),

        experience: z
            .number("Experience must be a number")
            .int("Experience must be an integer")
            .nonnegative("Experience cannot be negative")
            .optional(),

        currentWorkingPlace: z
            .string("Current working place is required")
            .min(2, "Current working place must be at least 2 characters")
            .max(50, "Current working place must be at most 50 characters"),

        designation: z
            .string("Designation is required")
            .min(2, "Designation must be at least 2 characters")
            .max(50, "Designation must be at most 50 characters"),
    }),
});
