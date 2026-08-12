"use server";

import { getUserInfo } from "@/services/auth.services";
import { ingestRagService, queryRagService } from "@/services/rag.services";
import { IRagSource } from "@/types/rag.types";

export interface QueryRagActionResult {
  success: boolean;
  answer?: string;
  sources?: IRagSource[];
  noContext?: boolean;
  error?: string;
}

export async function queryRagAction(
  query: string,
): Promise<QueryRagActionResult> {
  if (!query.trim()) {
    return { success: false, error: "Please enter a question." };
  }

  try {
    const response = await queryRagService({ query });

    const data = response.data;

    if (!data?.answer) {
      return {
        success: false,
        error: "No answer received from the AI. Please try again.",
      };
    }

    return {
      success: true,
      answer: data.answer,
      sources: data.sources ?? [],
      noContext: data.noContext,
    };
  } catch (error: unknown) {
    console.error("[queryRagAction] Error:", error);
    return {
      success: false,
      error: "Failed to reach the AI assistant. Please try again.",
    };
  }
}

export async function getUserRoleAction(): Promise<string | null> {
  try {
    const userInfo = await getUserInfo();
    return userInfo?.role ?? null;
  } catch (error) {
    console.error("[getUserRoleAction] Error:", error);
    return null;
  }
}

export interface IngestRagActionResult {
  success: boolean;
  indexedCount?: number;
  message?: string;
  error?: string;
}

export async function ingestRagAction(): Promise<IngestRagActionResult> {
  try {
    const response = await ingestRagService();

    return {
      success: true,
      indexedCount: response.data?.indexedCount,
      message:
        response.data?.message ??
        "Course data synced to the AI assistant successfully.",
    };
  } catch (error: unknown) {
    console.error("[ingestRagAction] Error:", error);
    return {
      success: false,
      error: "Failed to sync course data. Please try again.",
    };
  }
}