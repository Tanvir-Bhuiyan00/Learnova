import express from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { WishlistController } from "./wishlist.controller";
import { WishlistValidation } from "./wishlist.validation";

const router = express.Router();

router.post(
  "/",
  checkAuth(UserRole.STUDENT),
  validateRequest(WishlistValidation.addItemZodSchema),
  WishlistController.addItemToWishlist,
);

router.get(
  "/",
  checkAuth(UserRole.STUDENT),
  WishlistController.getMyWishlist,
);

router.delete(
  "/:id",
  checkAuth(UserRole.STUDENT),
  WishlistController.removeItemFromWishlist,
);

export const WishlistRoutes = router;
