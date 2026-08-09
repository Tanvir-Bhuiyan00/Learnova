import { describe, expect, it } from "vitest";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  isValidRedirectForRole,
} from "./authUtils";

describe("authUtils", () => {
  describe("isAuthRoute", () => {
    it("returns true for auth routes", () => {
      expect(isAuthRoute("/login")).toBe(true);
      expect(isAuthRoute("/register")).toBe(true);
      expect(isAuthRoute("/forgot-password")).toBe(true);
      expect(isAuthRoute("/reset-password")).toBe(true);
      expect(isAuthRoute("/verify-email")).toBe(true);
    });

    it("returns false for non-auth routes", () => {
      expect(isAuthRoute("/dashboard")).toBe(false);
      expect(isAuthRoute("/courses")).toBe(false);
    });
  });

  describe("getRouteOwner", () => {
    it("maps role-protected paths to their owner", () => {
      expect(getRouteOwner("/admin/dashboard/users")).toBe("ADMIN");
      expect(getRouteOwner("/instructor/dashboard/courses")).toBe("INSTRUCTOR");
      expect(getRouteOwner("/dashboard/courses")).toBe("STUDENT");
      expect(getRouteOwner("/my-profile")).toBe("COMMON");
    });

    it("returns null for public routes", () => {
      expect(getRouteOwner("/courses")).toBeNull();
      expect(getRouteOwner("/")).toBeNull();
    });
  });

  describe("getDefaultDashboardRoute", () => {
    it("returns the role-specific home", () => {
      expect(getDefaultDashboardRoute("ADMIN")).toBe("/admin/dashboard");
      expect(getDefaultDashboardRoute("SUPER_ADMIN")).toBe("/admin/dashboard");
      expect(getDefaultDashboardRoute("INSTRUCTOR")).toBe(
        "/instructor/dashboard",
      );
      expect(getDefaultDashboardRoute("STUDENT")).toBe("/dashboard");
    });
  });

  describe("isValidRedirectForRole", () => {
    it("unifies SUPER_ADMIN with ADMIN", () => {
      expect(isValidRedirectForRole("/admin/dashboard", "SUPER_ADMIN")).toBe(
        true,
      );
    });

    it("rejects cross-role redirects", () => {
      expect(isValidRedirectForRole("/dashboard", "ADMIN")).toBe(false);
      expect(
        isValidRedirectForRole("/instructor/dashboard", "STUDENT"),
      ).toBe(false);
    });

    it("allows public and common routes for any role", () => {
      expect(isValidRedirectForRole("/courses", "STUDENT")).toBe(true);
      expect(isValidRedirectForRole("/my-profile", "ADMIN")).toBe(true);
    });
  });
});
