import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { WishlistService } from "./wishlist.service";

const addItemToWishlist = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const result = await WishlistService.addItem(user, payload);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Item added to wishlist successfully",
    data: result,
  });
});

const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await WishlistService.getMyWishlist(user);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Wishlist retrieved successfully",
    data: result,
  });
});

const removeItemFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id as string;
  await WishlistService.removeItem(user, id);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Item removed from wishlist successfully",
    data: null,
  });
});

export const WishlistController = {
  addItemToWishlist,
  getMyWishlist,
  removeItemFromWishlist,
};
