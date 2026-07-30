import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { UserPermission } from "@/constants/AppResource/display-list/enum/user";

const PERMISSION_COOKIE_KEY = "auth-permission";

export function storePermissionRemember(
  permission: UserPermission | undefined
): void {
  if (typeof window === "undefined") {
    return;
  }

  setCookie(PERMISSION_COOKIE_KEY, permission, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
  });
}

export function storePermission(permission: UserPermission | undefined): void {
  if (typeof window === "undefined" || !permission) {
    return;
  }

  setCookie(PERMISSION_COOKIE_KEY, permission, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: "/",
  });
}

export function getPermission(): UserPermission | null {
  const cookieValue = getCookie(PERMISSION_COOKIE_KEY);
  return typeof cookieValue === "string" && cookieValue in UserPermission
    ? (cookieValue as UserPermission)
    : null;
}

export function logoutPermission(): void {
  deleteCookie(PERMISSION_COOKIE_KEY);
}

export function hasPermission(): boolean {
  return getPermission() !== null;
}
