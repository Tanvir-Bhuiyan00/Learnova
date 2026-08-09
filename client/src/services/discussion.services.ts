"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IDiscussion,
  ICreateDiscussionPayload,
  IUpdateDiscussionPayload,
  IDiscussionReply,
  ICreateReplyPayload,
  IUpdateReplyPayload,
} from "@/types/discussion.types";

export const getDiscussions = async (courseId?: string) => {
  try {
    const queryString = courseId ? `?courseId=${courseId}` : "";
    const discussions = await httpClient.get<IDiscussion[]>(
      `/discussions${queryString}`,
    );
    return discussions;
  } catch (error) {
    console.log("Error fetching discussions:", error);
    throw error;
  }
};

export const getDiscussionById = async (id: string) => {
  try {
    const discussion = await httpClient.get<IDiscussion>(`/discussions/${id}`);
    return discussion;
  } catch (error) {
    console.log("Error fetching discussion details:", error);
    throw error;
  }
};

export const createDiscussion = async (payload: ICreateDiscussionPayload) => {
  try {
    const discussion = await httpClient.post<IDiscussion>("/discussions", payload);
    return discussion;
  } catch (error) {
    console.log("Error creating discussion:", error);
    throw error;
  }
};

export const updateDiscussion = async (id: string, payload: IUpdateDiscussionPayload) => {
  try {
    const discussion = await httpClient.patch<IDiscussion>(`/discussions/${id}`, payload);
    return discussion;
  } catch (error) {
    console.log("Error updating discussion:", error);
    throw error;
  }
};

export const deleteDiscussion = async (id: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(`/discussions/${id}`);
    return result;
  } catch (error) {
    console.log("Error deleting discussion:", error);
    throw error;
  }
};

export const togglePinDiscussion = async (id: string) => {
  try {
    const discussion = await httpClient.patch<IDiscussion>(
      `/discussions/${id}/pin`,
      {},
    );
    return discussion;
  } catch (error) {
    console.log("Error toggling pin:", error);
    throw error;
  }
};

export const toggleResolveDiscussion = async (id: string) => {
  try {
    const discussion = await httpClient.patch<IDiscussion>(
      `/discussions/${id}/resolve`,
      {},
    );
    return discussion;
  } catch (error) {
    console.log("Error toggling resolve:", error);
    throw error;
  }
};

export const createReply = async (
  discussionId: string,
  payload: ICreateReplyPayload,
) => {
  try {
    const reply = await httpClient.post<IDiscussionReply>(
      `/discussions/${discussionId}/replies`,
      payload,
    );
    return reply;
  } catch (error) {
    console.log("Error creating reply:", error);
    throw error;
  }
};

export const deleteReply = async (replyId: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(
      `/discussions/replies/${replyId}`,
    );
    return result;
  } catch (error) {
    console.log("Error deleting reply:", error);
    throw error;
  }
};
