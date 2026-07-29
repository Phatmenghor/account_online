import { deleteCookie, getCookie, setCookie } from "cookies-next";

const ROLES_COOKIE_KEY = "auth-roles";

export function storeRolesRemember(role: string | undefined): void {
  if (typeof window === "undefined" || !role) {
    return;
  }

  setCookie(ROLES_COOKIE_KEY, role, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: "/",
  });
}

export function getRoles(): string | null {
  const cookieValue = getCookie(ROLES_COOKIE_KEY);
  return typeof cookieValue === "string" ? cookieValue : null;
}

export function storeRole(role: string | undefined): void {
  if (typeof window === "undefined" || !role) {
    return;
  }

  setCookie(ROLES_COOKIE_KEY, role, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });
}

/**
 * Logout the current user
 */
export function logoutRole(): void {
  deleteCookie(ROLES_COOKIE_KEY, { path: "/" });
}

export function logoutRoles(): void {
  deleteCookie(ROLES_COOKIE_KEY, { path: "/" });
}

export function hasRoles(): boolean {
  const cookieValue = getCookie(ROLES_COOKIE_KEY);
  return !!cookieValue;
}
