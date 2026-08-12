import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";
import { CookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";

export const checkAuth =
  (...authRoles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //Session Token Verification
      const sessionToken = CookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );

      let sessionUser: {
        id: string;
        role: UserRole;
        email: string;
        status: string;
        isDeleted: boolean;
      } | null = null;

      if (!sessionToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No session token provided.",
        );
      }

      const sessionExists = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (sessionExists && sessionExists.user) {
        const user = sessionExists.user;
        sessionUser = user;

        const now = new Date();
        const expiresAt = new Date(sessionExists.expiresAt);
        const createdAt = new Date(sessionExists.createdAt);

        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());

          console.log("Session Expiring Soon!!");
        }

        if (
          user.status === UserStatus.BLOCKED ||
          user.status === UserStatus.DELETED
        ) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access! User is not active.",
          );
        }

        if (user.isDeleted) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access! User is deleted.",
          );
        }

        if (authRoles.length > 0 && !authRoles.includes(user.role)) {
          throw new AppError(
            status.FORBIDDEN,
            "Forbidden access! You do not have permission to access this resource.",
          );
        }

        req.user = {
          userId: user.id,
          role: user.role,
          email: user.email,
        };
      } else {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! Invalid or expired session.",
        );
      }

      //Access Token Verification
      const accessToken = CookieUtils.getCookie(req, "accessToken");

      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No access token provided.",
        );
      }

      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET,
      );

      if (!verifiedToken.success) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! Invalid access token.",
        );
      }

      const tokenData = verifiedToken.data!;

      // Bind the access token's identity to the session's identity: both must
      // resolve to the same user, otherwise the token is stale or forged and
      // must not be trusted for authorization.
      if (sessionUser && sessionUser.id !== tokenData.userId) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! Session and access token do not match.",
        );
      }

      req.user = sessionUser
        ? {
            userId: sessionUser.id,
            role: sessionUser.role,
            email: sessionUser.email,
          }
        : {
            userId: tokenData.userId as string,
            role: tokenData.role as UserRole,
            email: tokenData.email as string,
          };

      if (
        authRoles.length > 0 &&
        !authRoles.includes(tokenData.role as UserRole)
      ) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource.",
        );
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };
