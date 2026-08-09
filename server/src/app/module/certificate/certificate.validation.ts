import { z } from "zod";

const generateCertificateZodSchema = z.object({
  enrollmentId: z.string("Enrollment ID is required"),
});

export const CertificateValidation = {
  generateCertificateZodSchema,
};
