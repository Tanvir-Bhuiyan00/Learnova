import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { CartController } from "./cart.controller";
import {
  addToCartZodSchema,
  applyCouponZodSchema,
} from "./cart.validation";

const router = Router();

router.get("/", checkAuth(UserRole.STUDENT), CartController.getCart);

router.post(
  "/items",
  checkAuth(UserRole.STUDENT),
  validateRequest(addToCartZodSchema),
  CartController.addToCart,
);

router.delete(
  "/items/:courseId",
  checkAuth(UserRole.STUDENT),
  CartController.removeFromCart,
);

router.post(
  "/coupon",
  checkAuth(UserRole.STUDENT),
  validateRequest(applyCouponZodSchema),
  CartController.applyCoupon,
);

router.delete(
  "/coupon",
  checkAuth(UserRole.STUDENT),
  CartController.removeCoupon,
);

export const CartRoutes = router;
