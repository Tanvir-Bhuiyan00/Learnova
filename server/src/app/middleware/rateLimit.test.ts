import { Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../config/env", () => ({
  envVars: { ACCESS_TOKEN_SECRET: "test-secret" },
}));

import { rateLimit, sweepRateLimitBuckets } from "./rateLimit";

describe("rateLimit", () => {
  let req: Request;
  let res: Response;

  const makeReq = (overrides: Record<string, unknown> = {}) => {
    const base = {
      ip: "203.0.113.10",
      socket: { remoteAddress: "203.0.113.10" },
      headers: {},
      get: (() => undefined) as unknown as Request["get"],
    };
    return {
      ...base,
      ...overrides,
      socket: {
        ...base.socket,
        ...((overrides.socket as { remoteAddress?: string }) ?? {}),
      },
    } as unknown as Request;
  };

  const makeRes = () =>
    ({
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }) as unknown as Response;

  const makeInternalReq = (containerIp: string, clientIp: string): Request => {
    const req = makeReq({
      ip: containerIp,
      socket: { remoteAddress: containerIp },
    });
    req.get = ((name: string) => {
      if (name === "X-Internal-Secret") return "test-secret";
      if (name === "X-Client-IP") return clientIp;
      return undefined;
    }) as unknown as Request["get"];
    return req;
  };

  beforeEach(() => {
    req = makeReq();
    res = makeRes();
    sweepRateLimitBuckets();
  });

  afterEach(() => {
    sweepRateLimitBuckets();
    vi.restoreAllMocks();
  });

  it("allows requests under the limit", () => {
    const next = vi.fn();
    const limiter = rateLimit({ windowMs: 60000, max: 3, keyPrefix: "t" });

    for (let i = 0; i < 3; i++) {
      limiter(req, res, next);
    }

    expect(next).toHaveBeenCalledTimes(3);
  });

  it("blocks requests over the limit with 429", () => {
    const next = vi.fn();
    const limiter = rateLimit({ windowMs: 60000, max: 2, keyPrefix: "t" });

    limiter(req, res, next);
    limiter(req, res, next);
    limiter(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Too many requests, please try again later.",
    });
  });

  it("buckets by the real client IP forwarded by the internal client", () => {
    const next = vi.fn();
    const limiter = rateLimit({ windowMs: 60000, max: 2, keyPrefix: "t" });

    limiter(makeInternalReq("172.18.0.4", "198.51.100.42"), res, next);
    limiter(makeInternalReq("172.18.0.4", "198.51.100.42"), res, next);

    // Same visitor IP from a different container hop shares the same bucket.
    limiter(makeInternalReq("172.18.0.5", "198.51.100.42"), res, next);

    expect(res.status).toHaveBeenCalledWith(429);
  });

  it("does NOT trust X-Client-IP without a valid internal secret", () => {
    const next = vi.fn();
    const limiter = rateLimit({ windowMs: 60000, max: 2, keyPrefix: "t" });

    const spoofedReq = makeReq({
      get: vi.fn((name: string) => {
        if (name === "X-Internal-Secret") return "wrong-secret";
        if (name === "X-Client-IP") return "198.51.100.42";
        return undefined;
      }) as unknown as Request["get"],
    });

    limiter(spoofedReq, res, next);
    limiter(spoofedReq, res, next);
    limiter(spoofedReq, res, next);

    // Exceeded via the real req.ip (203.0.113.10) — the spoofed X-Client-IP
    // must be ignored, otherwise 198.51.100.42 would get a fresh bucket.
    expect(res.status).toHaveBeenCalledWith(429);
  });
});
