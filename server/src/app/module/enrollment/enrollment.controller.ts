import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { EnrollmentService } from "./enrollment.service";

const checkoutCart = catchAsync(async (req: Request, res: Response) => {
  const result = await EnrollmentService.checkoutCart(req.user);

  if (result.paymentUrl) {
    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Checkout initiated. Redirect to payment.",
      data: { paymentUrl: result.paymentUrl },
    });
  } else {
    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Enrolled successfully",
      data: { enrollments: result.enrollments },
    });
  }
});

const getMyEnrollments = catchAsync(async (req: Request, res: Response) => {
  const result = await EnrollmentService.getMyEnrollments(req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Enrollments retrieved successfully",
    data: result,
  });
});

const getSingleEnrollment = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await EnrollmentService.getSingleEnrollment(id, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Enrollment retrieved successfully",
    data: result,
  });
});

const getAllEnrollments = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await EnrollmentService.getAllEnrollments(query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All enrollments retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const EnrollmentController = {
  checkoutCart,
  getMyEnrollments,
  getSingleEnrollment,
  getAllEnrollments,
};
