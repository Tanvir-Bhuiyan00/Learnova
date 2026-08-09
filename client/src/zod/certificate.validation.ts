import { z } from "zod";

export const generateCertificateZodSchema = z.object({
  enrollmentId: z.string(),
});
