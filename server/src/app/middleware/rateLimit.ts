import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

interface RateLimitWindow {
  windowMs: number;
  max: number;
  keyPrefix: string;
  message?: string;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const buckets = new Map<string, number[]>();

const MAX_ENTRY_AGE_MS = 15 * 60 * 1000;

const sweep = () => {
  const now = Date.now();
  for (const [key, timestamps] of buckets) {
    const newest = timestamps[timestamps.length - 1];
    if (!newest || now - newest > MAX_ENTRY_AGE_MS) {
      buckets.delete(key);
    }
  }
};

const check = (
  key: string,
  windowMs: number,
  max: number,
): RateLimitResult => {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter(
    (t) => now - t < windowMs,
  );

  if (timestamps.length >= max) {
    const oldest = timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return { allowed: true, retryAfterSeconds: 0 };
};

export const rateLimit = ({
  windowMs,
  max,
  keyPrefix,
  message = "Too many requests, please try again later.",
}: RateLimitWindow) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${keyPrefix}:${req.ip ?? "unknown"}`;
    const result = check(key, windowMs, max);

    if (!result.allowed) {
      res.setHeader("Retry-After", String(result.retryAfterSeconds));
      return res.status(httpStatus.TOO_MANY_REQUESTS).json({
        success: false,
        message,
      });
    }

    next();
  };
};

export const sweepRateLimitBuckets = () => sweep();