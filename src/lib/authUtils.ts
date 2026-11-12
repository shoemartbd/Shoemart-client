// WHOLESALER is a customer who also sees their wholesale orders: it uses the
// customer dashboard (/dashboard) like USER.
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER" | "WHOLESALER";

// The route owner a role maps to (SUPER_ADMIN -> ADMIN, WHOLESALER -> USER)
export const routeRoleOf = (role: UserRole | null) =>
  role === "SUPER_ADMIN" ? "ADMIN" : role === "WHOLESALER" ? "USER" : role;

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
  exact: [
    "/my-profile",
    "/change-password",
    "/payment/success",
    "/payment/cancel",
  ],
  pattern: [],
};

export const adminProtectedRoutes: RouteConfig = {
  pattern: [/^\/admin\/dashboard/], // Matches any path that starts with /admin/dashboard
  exact: [],
};

export const userProtectedRoutes: RouteConfig = {
  pattern: [/^\/dashboard/], // Matches any path that starts with /dashboard
  exact: [],
};

export const isRouteMatches = (pathname: string, routes: RouteConfig) => {
  if (routes.exact.includes(pathname)) {
    return true;
  }
  return routes.pattern.some((pattern: RegExp) => pattern.test(pathname));
};

export const getRouteOwner = (
  pathname: string,
): "SUPER_ADMIN" | "ADMIN" | "USER" | "COMMON" | null => {
  if (isRouteMatches(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  }

  if (isRouteMatches(pathname, userProtectedRoutes)) {
    return "USER";
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

  if (role === "USER" || role === "WHOLESALER") {
    return "/dashboard";
  }

  return "/";
};

export const getProfileRoute = (role: UserRole) => {
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    return "/admin/dashboard/my-profile";
  }

  if (role === "USER" || role === "WHOLESALER") {
    return "/dashboard/my-profile";
  }

  return "/";
};

export const isValidRedirectForRole = (
  redirectPath: string,
  role: UserRole,
) => {
  const routeRole = routeRoleOf(role);

  const routeOwner = getRouteOwner(redirectPath);

  if (routeOwner === null || routeOwner === "COMMON") {
    return true;
  }

  if (routeOwner === routeRole) {
    return true;
  }

  return false;
};
