import { z } from "zod";

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
};

export const createInstructorFormZodSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters")
    .max(30, "Name must be at most 30 characters"),
  email: z.email("Invalid email address"),
  contactNumber: z
    .string()
    .trim()
    .min(11, "Contact number must be at least 11 characters")
    .max(14, "Contact number must be at most 14 characters"),
  address: z
    .string()
    .trim()
    .max(100, "Address must be at most 100 characters")
    .refine(
      (value) => value.length === 0 || value.length >= 10,
      "Address must be at least 10 characters",
    ),
  bio: z
    .string()
    .trim()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  qualification: z
    .string()
    .trim()
    .min(2, "Qualification must be at least 2 characters")
    .max(50, "Qualification must be at most 50 characters"),
  experience: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^\d+$/.test(value),
      "Experience must be an integer",
    ),
  currentWorkingPlace: z
    .string()
    .trim()
    .min(2, "Current working place must be at least 2 characters")
    .max(50, "Current working place must be at most 50 characters"),
  designation: z
    .string()
    .trim()
    .min(2, "Designation must be at least 2 characters")
    .max(50, "Designation must be at most 50 characters"),
});

export const createInstructorServerZodSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at most 20 characters"),
  instructor: z.object({
    name: z
      .string()
      .trim()
      .min(5, "Name must be at least 5 characters")
      .max(30, "Name must be at most 30 characters"),
    email: z.email("Invalid email address"),
    contactNumber: z
      .string()
      .trim()
      .min(11, "Contact number must be at least 11 characters")
      .max(14, "Contact number must be at most 14 characters")
      .optional(),
    address: z.preprocess(
      emptyStringToUndefined,
      z
        .string()
        .trim()
        .min(10, "Address must be at least 10 characters")
        .max(100, "Address must be at most 100 characters")
        .optional(),
    ),
    profilePhoto: z.string().optional(),
    bio: z.preprocess(
      emptyStringToUndefined,
      z
        .string()
        .trim()
        .min(10, "Bio must be at least 10 characters")
        .max(500, "Bio must be at most 500 characters")
        .optional(),
    ),
    qualification: z
      .string()
      .trim()
      .min(2, "Qualification must be at least 2 characters")
      .max(50, "Qualification must be at most 50 characters"),
    experience: z.preprocess(
      emptyStringToUndefined,
      z.coerce
        .number({ error: "Experience must be a number" })
        .int("Experience must be an integer")
        .nonnegative("Experience cannot be negative")
        .optional(),
    ),
    currentWorkingPlace: z
      .string()
      .trim()
      .min(2, "Current working place must be at least 2 characters")
      .max(50, "Current working place must be at most 50 characters"),
    designation: z
      .string()
      .trim()
      .min(2, "Designation must be at least 2 characters")
      .max(50, "Designation must be at most 50 characters"),
  }),
}) satisfies z.ZodType<{
  password: string;
  instructor: {
    name: string;
    email: string;
    contactNumber?: string;
    address?: string;
    profilePhoto?: string;
    bio?: string;
    qualification: string;
    experience?: number;
    currentWorkingPlace: string;
    designation: string;
  };
}>;

export const editInstructorFormZodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters")
    .max(30, "Name must be at most 30 characters"),
  contactNumber: z
    .string()
    .trim()
    .min(11, "Contact number must be at least 11 characters")
    .max(14, "Contact number must be at most 14 characters"),
  address: z
    .string()
    .trim()
    .max(100, "Address must be at most 100 characters")
    .refine(
      (value) => value.length === 0 || value.length >= 10,
      "Address must be at least 10 characters",
    ),
  bio: z
    .string()
    .trim()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  qualification: z
    .string()
    .trim()
    .min(2, "Qualification must be at least 2 characters")
    .max(50, "Qualification must be at most 50 characters"),
  experience: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || /^\d+$/.test(value),
      "Experience must be an integer",
    ),
  currentWorkingPlace: z
    .string()
    .trim()
    .min(2, "Current working place must be at least 2 characters")
    .max(50, "Current working place must be at most 50 characters"),
  designation: z
    .string()
    .trim()
    .min(2, "Designation must be at least 2 characters")
    .max(50, "Designation must be at most 50 characters"),
});

export const updateInstructorServerZodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Name must be at least 5 characters")
    .max(30, "Name must be at most 30 characters")
    .optional(),
  profilePhoto: z.string().optional(),
  contactNumber: z
    .string()
    .trim()
    .min(11, "Contact number must be at least 11 characters")
    .max(14, "Contact number must be at most 14 characters")
    .optional(),
  address: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .min(10, "Address must be at least 10 characters")
      .max(100, "Address must be at most 100 characters")
      .optional(),
  ),
  bio: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .max(500, "Bio must be at most 500 characters")
      .optional(),
  ),
  qualification: z
    .string()
    .trim()
    .min(2, "Qualification must be at least 2 characters")
    .max(100, "Qualification must be at most 100 characters")
    .optional(),
  experience: z.preprocess(
    emptyStringToUndefined,
    z.coerce
      .number({ error: "Experience must be a number" })
      .int("Experience must be an integer")
      .nonnegative("Experience cannot be negative")
      .optional(),
  ),
  currentWorkingPlace: z
    .string()
    .trim()
    .min(2, "Current working place must be at least 2 characters")
    .max(100, "Current working place must be at most 100 characters")
    .optional(),
  designation: z
    .string()
    .trim()
    .min(2, "Designation must be at least 2 characters")
    .max(100, "Designation must be at most 100 characters")
    .optional(),
});

export type ICreateInstructorFormValues = z.infer<typeof createInstructorFormZodSchema>;
export type IEditInstructorFormValues = z.infer<typeof editInstructorFormZodSchema>;
