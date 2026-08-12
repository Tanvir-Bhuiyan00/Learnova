export type UserRole = "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";

export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export const isAuthRoute = (pathname: string) => {
  return authRoutes.some((router: string) => router === pathname);
};

export type RouteConfig = {
  exact: string[];
  pattern: RegExp[];
};

export const commonProtectedRoutes: RouteConfig = {
  exact: ["/my-profile", "/change-password"],
  pattern: [],
};

export const instructorProtectedRoutes: RouteConfig = {
  pattern: [/^\/instructor\/dashboard/], // Matches any path that starts with /instructor/dashboard
  exact: [],
};

export const adminProtectedRoutes: RouteConfig = {
  pattern: [/^\/admin\/dashboard/], // Matches any path that starts with /admin/dashboard
  exact: [],
};

// export const superAdminProtectedRoutes : RouteConfig = {
//     pattern: [/^\/admin\/dashboard/ ], // Matches any path that starts with /super-admin/dashboard
//     exact : []
// }

export const studentProtectedRoutes: RouteConfig = {
  pattern: [/^\/dashboard/], // Matches any path that starts with /dashboard
  exact: ["/payment/success"],
};

export const isRouteMatches = (pathname: string, routes: RouteConfig) => {
  if (routes.exact.includes(pathname)) {
    return true;
  }
  return routes.pattern.some((pattern: RegExp) => pattern.test(pathname));
};

export const getRouteOwner = (
  pathname: string,
): "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT" | "COMMON" | null => {
  if (isRouteMatches(pathname, instructorProtectedRoutes)) {
    return "INSTRUCTOR";
  }

  // if (isRouteMatches(pathname, superAdminProtectedRoutes)) {
  //     return "SUPER_ADMIN";
  // }

  if (isRouteMatches(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  }

  if (isRouteMatches(pathname, studentProtectedRoutes)) {
    return "STUDENT";
  }

  if (isRouteMatches(pathname, commonProtectedRoutes)) {
    return "COMMON";
  }

  return null; // public route
};

export const getDefaultDashboardRoute = (role: UserRole) => {
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return "/admin/dashboard";
  }
  if (role === "INSTRUCTOR") {
    return "/instructor/dashboard";
  }
  if (role === "STUDENT") {
    return "/dashboard";
  }

  return "/";
};

const isSafeRelativePath = (path: string): boolean => {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return false;
  }

  // Block protocol-relative and absolute URLs ("https://", "javascript:",
  // "data:", etc.) passing through as redirect targets.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) {
    return false;
  }

  return true;
};

export const isValidRedirectForRole = (
  redirectPath: string,
  role: UserRole,
) => {
  const unifySuperAdminAndAdminRole = role === "SUPER_ADMIN" ? "ADMIN" : role;

  role = unifySuperAdminAndAdminRole;

  if (!isSafeRelativePath(redirectPath)) {
    return false;
  }

  const sanitizedRedirectPath = redirectPath.split("?")[0] || redirectPath;
  const routeOwner = getRouteOwner(sanitizedRedirectPath);

  if (routeOwner === null || routeOwner === "COMMON") {
    return true;
  }

  if (routeOwner === role) {
    return true;
  }

  return false;
};
