import { NextFunction, Request, Response } from "express";
import { UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { prisma } from "../lib/prisma";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";

/**
 * Best-effort authentication for public endpoints (e.g. the course catalog).
 * Resolves req.user when a valid BetterAuth session + access token pair is
 * present, and leaves req.user undefined otherwise. Never rejects — public
 * pages must keep working for anonymous visitors.
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");

    if (sessionToken) {
      const session = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (session?.user && session.user.status === UserStatus.ACTIVE && !session.user.isDeleted) {
        req.user = {
          userId: session.user.id,
          role: session.user.role,
          email: session.user.email,
        };
      }
    }

    const accessToken = CookieUtils.getCookie(req, "accessToken");
    if (accessToken) {
      const verified = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
      if (verified.success && req.user) {
        const tokenData = verified.data!;
        if (req.user.userId !== (tokenData.userId as string)) {
          req.user = undefined as never;
        }
      }
    }

    next();
  } catch {
    next();
  }
};
