"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IRagQueryData } from "@/types/rag.types";

export interface IRagQueryPayload {
  query: string;
  limit?: number;
  sourceType?: string;
}

export const queryRagService = async (payload: IRagQueryPayload) => {
  try {
    const response = await httpClient.post<IRagQueryData>("/rag/query", payload);
    return response;
  } catch (error) {
    console.log("Error querying RAG:", error);
    throw error;
  }
};

export interface IRagIngestData {
  success: boolean;
  message: string;
  indexedCount: number;
}

export const ingestRagService = async () => {
  try {
    const response = await httpClient.post<IRagIngestData>(
      "/rag/ingest",
      {},
    );
    return response;
  } catch (error) {
    console.log("Error ingesting RAG data:", error);
    throw error;
  }
};