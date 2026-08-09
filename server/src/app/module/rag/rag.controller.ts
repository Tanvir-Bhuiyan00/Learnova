import { Request, Response } from "express";
import status from "http-status";
import { RAG_CACHE_TTL_SECONDS, redis } from "../../lib/redis";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { RAGService } from "./rag.service";

const getStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await RAGService.getStats();

  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "RAG stats retrieved successfully",
    data: result,
  });
});

const ingest = catchAsync(async (_req: Request, res: Response) => {
  const result = await RAGService.ingestLearnovaData();

  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Course data ingestion completed",
    data: result,
  });
});

const queryRag = catchAsync(async (req: Request, res: Response) => {
  const { query, limit, sourceType } = req.body as {
    query?: string;
    limit?: number;
    sourceType?: string;
  };

  if (!query || typeof query !== "string" || !query.trim()) {
    return sendResponse(res, {
      success: false,
      httpStatusCode: status.BAD_REQUEST,
      message: "Query is required",
    });
  }

  const queryLimit = Math.min(Math.max(Number(limit) || 5, 1), 10);
  const cacheKey = `rag:query:${query.trim().toLowerCase()}:${queryLimit}:${
    sourceType || "all"
  }`;

  if (redis) {
    try {
      const cachedResult = await redis.get(cacheKey);

      if (cachedResult) {
        return sendResponse(res, {
          success: true,
          httpStatusCode: status.OK,
          message: "Answer retrieved from cache",
          data: cachedResult,
        });
      }
    } catch (cacheError) {
      console.warn(
        "Cache read error, proceeding with normal processing:",
        cacheError,
      );
    }
  }

  const result = await RAGService.generateAnswer(
    query.trim(),
    queryLimit,
    sourceType,
  );

  if (redis) {
    try {
      await redis.set(cacheKey, result, { ex: RAG_CACHE_TTL_SECONDS });
    } catch (cacheError) {
      console.warn("Cache write error:", cacheError);
    }
  }

  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Answer generated successfully",
    data: result,
  });
});

export const RagController = {
  getStats,
  ingest,
  queryRag,
};
