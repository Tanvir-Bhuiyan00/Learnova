import { z } from "zod";

export const initiatePaymentZodSchema = z.object({
  enrollmentId: z.string(),
});
