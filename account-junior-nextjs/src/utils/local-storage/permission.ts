import { deleteCookie } from "cookies-next";
import { UserPermission } from "@/constants/AppResource/display-list/enum/user";

const PERMISSION_STORAGE_KEY = "auth-permission";

export function storePermissionRemember(
  permission: UserPermission | undefined
): void {
  storePermission(permission);
}

export function storePermission(permission: UserPermission | undefined): void {
  if (typeof window === "undefined" || !permission) return;
  try {
    localStorage.setItem(PERMISSION_STORAGE_KEY, String(permission));
    deleteCookie(PERMISSION_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to store permission", e);
  }
}

export function getPermission(): UserPermission | null {
  if (typeof window === "undefined") return null;
  const val = localStorage.getItem(PERMISSION_STORAGE_KEY);
  return val && val in UserPermission ? (val as UserPermission) : null;
}

export function logoutPermission(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PERMISSION_STORAGE_KEY);
  deleteCookie(PERMISSION_STORAGE_KEY);
}

export function hasPermission(): boolean {
  const perm = getPermission();
  return !!perm;
}
