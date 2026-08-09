import { Request, Response } from "express";
import httpStatus from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { DiscussionService } from "./discussion.service";

const createDiscussion = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const payload = req.body;
  const result = await DiscussionService.createDiscussion(user, payload);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Discussion created successfully",
    data: result,
  });
});

const getAllDiscussions = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.query.courseId as string | undefined;
  const query: IQueryParams = { ...(req.query as IQueryParams) };
  if (!query.limit) query.limit = "50";
  const result = await DiscussionService.getAllDiscussions(query, courseId);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Discussions retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getDiscussionById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await DiscussionService.getDiscussionById(id);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Discussion retrieved successfully",
    data: result,
  });
});

const updateDiscussion = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id as string;
  const payload = req.body;
  const result = await DiscussionService.updateDiscussion(user, id, payload);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Discussion updated successfully",
    data: result,
  });
});

const deleteDiscussion = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id as string;
  const result = await DiscussionService.deleteDiscussion(user, id);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Discussion deleted successfully",
    data: result,
  });
});

const togglePinDiscussion = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await DiscussionService.togglePinDiscussion(id);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: `Discussion ${result.isPinned ? "pinned" : "unpinned"} successfully`,
    data: result,
  });
});

const toggleResolveDiscussion = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const id = req.params.id as string;
    const result = await DiscussionService.toggleResolveDiscussion(user, id);

    sendResponse(res, {
      httpStatusCode: httpStatus.OK,
      success: true,
      message: `Discussion ${result.isResolved ? "resolved" : "unresolved"} successfully`,
      data: result,
    });
  },
);

const createReply = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const discussionId = req.params.discussionId as string;
  const payload = req.body;
  const result = await DiscussionService.createReply(
    user,
    discussionId,
    payload,
  );

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Reply created successfully",
    data: result,
  });
});

const deleteReply = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const replyId = req.params.replyId as string;
  const result = await DiscussionService.deleteReply(user, replyId);

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Reply deleted successfully",
    data: result,
  });
});

export const DiscussionController = {
  createDiscussion,
  getAllDiscussions,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion,
  togglePinDiscussion,
  toggleResolveDiscussion,
  createReply,
  deleteReply,
};
