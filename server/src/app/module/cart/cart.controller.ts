import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CartService } from "./cart.service";

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.addToCart(req.body, req.user);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Course added to cart successfully",
    data: result,
  });
});

const removeFromCart = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const result = await CartService.removeFromCart(courseId, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Course removed from cart successfully",
    data: result,
  });
});

const getCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.getCart(req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Cart retrieved successfully",
    data: result,
  });
});

const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.applyCoupon(req.body, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Coupon applied successfully",
    data: result,
  });
});

const removeCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.removeCoupon(req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Coupon removed successfully",
    data: result,
  });
});

export const CartController = {
  addToCart,
  removeFromCart,
  getCart,
  applyCoupon,
  removeCoupon,
};
