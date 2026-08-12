import express from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CertificateController } from "./certificate.controller";
import { CertificateValidation } from "./certificate.validation";

const router = express.Router();

router.post(
  "/generate",
  checkAuth(UserRole.STUDENT),
  validateRequest(CertificateValidation.generateCertificateZodSchema),
  CertificateController.generateCertificate,
);

router.get(
  "/",
  checkAuth(UserRole.STUDENT),
  CertificateController.getMyCertificates,
);

router.get("/verify/:id", CertificateController.verifyCertificate);

router.get("/:id", checkAuth(), CertificateController.getCertificateById);

export const CertificateRoutes = router;
