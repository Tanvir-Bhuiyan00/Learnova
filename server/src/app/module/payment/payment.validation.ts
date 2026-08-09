import z from "zod";

export const initiatePaymentZodSchema = z.object({
  enrollmentId: z.string("Enrollment ID is required"),
});
