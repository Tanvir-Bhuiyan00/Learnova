import { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "../../generated/prisma/enums";

vi.mock("../config/env", () => ({
  envVars: { ACCESS_TOKEN_SECRET: "test-secret" },
}));

const sessionFindManyMock = vi.hoisted(() => vi.fn());
vi.mock("../lib/prisma", () => ({
  prisma: {
    session: { findFirst: sessionFindManyMock },
  },
}));

const getCookieMock = vi.hoisted(() => vi.fn());
vi.mock("../utils/cookie", () => ({
  CookieUtils: {
    getCookie: getCookieMock,
  },
}));

const verifyTokenMock = vi.hoisted(() => vi.fn());
vi.mock("../utils/jwt", () => ({
  jwtUtils: {
    verifyToken: verifyTokenMock,
  },
}));

import { checkAuth } from "./checkAuth";

const makeAppError = (err: unknown) => err as { statusCode: number };

describe("checkAuth", () => {
  type MockNextFunction = NextFunction & { mock: { calls: unknown[][] } };
  let req: Request;
  let res: Response;
  let next: MockNextFunction;

  const validSession = {
    user: {
      id: "user-1",
      email: "student@learnova.test",
      role: UserRole.STUDENT,
      status: "ACTIVE",
      isDeleted: false,
    },
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
  };

  beforeEach(() => {
    req = { cookies: {} } as Request;
    res = { setHeader: vi.fn() } as unknown as Response;
    next = vi.fn() as unknown as MockNextFunction;
    vi.clearAllMocks();

    getCookieMock.mockImplementation(
      (req: Request, key: string) => req.cookies[key],
    );
    verifyTokenMock.mockImplementation((token: string, _secret: string) =>
      token === "valid-access-token"
        ? {
            success: true,
            data: {
              userId: "user-1",
              email: validSession.user.email,
              role: UserRole.STUDENT,
            },
          }
        : token === "foreign-access-token"
          ? {
              success: true,
              data: {
                userId: "other-user",
                email: "other@learnova.test",
                role: UserRole.STUDENT,
              },
            }
          : { success: false },
    );
  });

  it("rejects when no session token cookie is present", async () => {
    await checkAuth()(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(makeAppError(next.mock.calls[0][0]).statusCode).toBe(401);
  });

  it("rejects when the session token is not found in the database", async () => {
    req.cookies["better-auth.session_token"] = "unknown-session";
    sessionFindManyMock.mockResolvedValue(null);

    await checkAuth()(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(makeAppError(next.mock.calls[0][0]).statusCode).toBe(401);
  });

  it("rejects blocked session users", async () => {
    req.cookies["better-auth.session_token"] = "session-1";
    sessionFindManyMock.mockResolvedValue({
      ...validSession,
      user: { ...validSession.user, status: "BLOCKED" },
    });

    await checkAuth()(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(makeAppError(next.mock.calls[0][0]).statusCode).toBe(401);
  });

  it("rejects session users without the required role", async () => {
    req.cookies["better-auth.session_token"] = "session-1";
    sessionFindManyMock.mockResolvedValue(validSession);

    await checkAuth(UserRole.INSTRUCTOR)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(makeAppError(next.mock.calls[0][0]).statusCode).toBe(403);
  });

  it("rejects when the access token cookie is missing", async () => {
    req.cookies["better-auth.session_token"] = "session-1";
    sessionFindManyMock.mockResolvedValue(validSession);

    await checkAuth(UserRole.STUDENT)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(makeAppError(next.mock.calls[0][0]).statusCode).toBe(401);
  });

  it("rejects invalid access tokens", async () => {
    req.cookies["better-auth.session_token"] = "session-1";
    req.cookies.accessToken = "expired-access-token";
    sessionFindManyMock.mockResolvedValue(validSession);

    await checkAuth(UserRole.STUDENT)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(makeAppError(next.mock.calls[0][0]).statusCode).toBe(401);
  });

  it("rejects when access token belongs to a different user than the session", async () => {
    req.cookies["better-auth.session_token"] = "session-1";
    req.cookies.accessToken = "foreign-access-token";
    sessionFindManyMock.mockResolvedValue(validSession);

    await checkAuth(UserRole.STUDENT)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(makeAppError(next.mock.calls[0][0]).statusCode).toBe(401);
  });

  it("attaches req.user and continues when session and token are valid", async () => {
    req.cookies["better-auth.session_token"] = "session-1";
    req.cookies.accessToken = "valid-access-token";
    sessionFindManyMock.mockResolvedValue(validSession);

    await checkAuth(UserRole.STUDENT)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeUndefined();
    expect((req as Request & { user: unknown }).user).toEqual({
      userId: "user-1",
      email: "student@learnova.test",
      role: UserRole.STUDENT,
    });
  });
});