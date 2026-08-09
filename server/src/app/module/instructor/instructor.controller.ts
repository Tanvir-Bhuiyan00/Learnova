import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { InstructorService } from "./instructor.service";

const getAllInstructors = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await InstructorService.getAllInstructors(query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Instructors fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getInstructorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const instructor = await InstructorService.getInstructorById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Instructor fetched successfully",
    data: instructor,
  });
});

const updateInstructor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const updatedInstructor = await InstructorService.updateInstructor(id as string, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Instructor updated successfully",
    data: updatedInstructor,
  });
});

const deleteInstructor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await InstructorService.deleteInstructor(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Instructor deleted successfully",
    data: result,
  });
});

export const InstructorController = {
  getAllInstructors,
  getInstructorById,
  updateInstructor,
  deleteInstructor,
};
