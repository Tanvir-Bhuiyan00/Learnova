"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IAdmin,
  IChangeUserRolePayload,
  IChangeUserStatusPayload,
} from "@/types/admin.types";

export const getAdmins = async (queryString?: string) => {
  try {
    const admins = await httpClient.get<IAdmin[]>(
      `/admins${queryString ? `?${queryString}` : ""}`,
    );
    return admins;
  } catch (error) {
    console.log("Error fetching admins:", error);
    throw error;
  }
};

export const changeUserStatus = async (payload: IChangeUserStatusPayload) => {
  try {
    const result = await httpClient.patch<{ message: string }>(
      "/admins/change-user-status",
      payload,
    );
    return result;
  } catch (error) {
    console.log("Error changing user status:", error);
    throw error;
  }
};

export const changeUserRole = async (payload: IChangeUserRolePayload) => {
  try {
    const result = await httpClient.patch<{ message: string }>(
      "/admins/change-user-role",
      payload,
    );
    return result;
  } catch (error) {
    console.log("Error changing user role:", error);
    throw error;
  }
};
