import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AssignmentService } from "./assignment.service";

const createAssignment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const result = await AssignmentService.createAssignment(user, payload);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Assignment created successfully",
    data: result,
  });
});

const getAllAssignments = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.query.courseId as string | undefined;
  const query: IQueryParams = { ...(req.query as IQueryParams) };
  if (!query.limit) query.limit = "50";
  const result = await AssignmentService.getAllAssignments(query, courseId);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Assignments retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAssignmentById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await AssignmentService.getAssignmentById(id, req.user);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Assignment retrieved successfully",
    data: result,
  });
});

const updateAssignment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id as string;
  const payload = req.body;
  const result = await AssignmentService.updateAssignment(user, id, payload);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Assignment updated successfully",
    data: result,
  });
});

const deleteAssignment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id as string;
  const result = await AssignmentService.deleteAssignment(user, id);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Assignment deleted successfully",
    data: result,
  });
});

const submitAssignment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id as string;
  const file = req.file;
  const fileUrl = file?.path;
  const content = req.body.data
    ? JSON.parse(req.body.data).content
    : req.body.content;
  const result = await AssignmentService.submitAssignment(
    user,
    id,
    fileUrl,
    content,
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Assignment submitted successfully",
    data: result,
  });
});

const getSubmissions = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id as string;
  const result = await AssignmentService.getSubmissions(user, id);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Submissions retrieved successfully",
    data: result,
  });
});

const gradeSubmission = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const submissionId = req.params.submissionId as string;
  const payload = req.body;
  const result = await AssignmentService.gradeSubmission(
    user,
    submissionId,
    payload,
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Submission graded successfully",
    data: result,
  });
});

export const AssignmentController = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
};
