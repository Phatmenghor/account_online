import { UserModel } from "@/features/user/types/user.response";
import { deleteCookie } from "cookies-next";

const USER_INFO_STORAGE_KEY = "auth-user-info";

export function storeUserInfo(user: UserModel | undefined): void {
  if (typeof window === "undefined" || !user) return;
  try {
    localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(user));
    deleteCookie(USER_INFO_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to store user info in localStorage", e);
  }
}

export function getUserInfo(): UserModel | null {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(USER_INFO_STORAGE_KEY);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export function clearUserInfo(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_INFO_STORAGE_KEY);
  deleteCookie(USER_INFO_STORAGE_KEY);
}
