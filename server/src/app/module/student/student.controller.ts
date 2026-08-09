import { Request, Response } from "express";
import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { StudentService } from "./student.service";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;

  const result = await StudentService.getMyProfile(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const payload = req.body;

  const result = await StudentService.updateMyProfile(user.userId, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;

  const result = await StudentService.deleteMyAccount(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Account deleted successfully",
    data: result,
  });
});

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;

  const result = await StudentService.getDashboardStats(user.userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Dashboard stats fetched successfully",
    data: result,
  });
});

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await StudentService.getAllStudents(query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Students fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getStudentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const student = await StudentService.getStudentById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Student fetched successfully",
    data: student,
  });
});

const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const updatedStudent = await StudentService.updateStudent(id as string, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Student updated successfully",
    data: updatedStudent,
  });
});

const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await StudentService.deleteStudent(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Student deleted successfully",
    data: result,
  });
});

export const StudentController = {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
  getDashboardStats,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
