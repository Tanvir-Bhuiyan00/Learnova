import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { PaymentController } from "./payment.controller";

const router = Router();

router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  PaymentController.getAllPayments,
);

router.get(
  "/my-payments",
  checkAuth(UserRole.STUDENT),
  PaymentController.getMyPayments,
);

export const PaymentRoutes = router;
