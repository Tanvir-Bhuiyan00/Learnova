import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { envVars } from "../config/env";

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

// All API traffic arrives through the trusted Next.js client, which forwards
// the real visitor address in X-Client-IP and proves it is the internal
// client by presenting the shared ACCESS_TOKEN_SECRET (the same value the
// client container uses to verify JWTs). Without this, every user would be
// bucketed under the client container's single IP and the shared allowance
// would be exhausted — blanking dashboards for everyone once /auth/me starts
// returning 429. External callers do not know the secret, so they cannot
// spoof a different rate-limit key.
const getClientKeyIp = (req: Request): string => {
  const internalSecret = req.get("X-Internal-Secret");

  if (
    internalSecret &&
    internalSecret.trim().length > 0 &&
    envVars.ACCESS_TOKEN_SECRET &&
    internalSecret.trim() === envVars.ACCESS_TOKEN_SECRET
  ) {
    const clientIp = req.get("X-Client-IP");
    if (clientIp && clientIp.trim().length > 0) {
      return clientIp.trim();
    }
  }

  return req.ip ?? req.socket.remoteAddress ?? "unknown";
};

export const rateLimit = ({
  windowMs,
  max,
  keyPrefix,
  message = "Too many requests, please try again later.",
}: RateLimitWindow) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${keyPrefix}:${getClientKeyIp(req)}`;
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