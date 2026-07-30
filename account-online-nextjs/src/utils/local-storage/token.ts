import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

function setNativeCookie(name: string, value: string, maxAge: number): void {
  if (typeof window === "undefined") return;
  const expires = new Date();
  expires.setSeconds(expires.getSeconds() + maxAge);
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}`;
}

function deleteNativeCookie(name: string): void {
  if (typeof window === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

const ACCESS_TOKEN_KEY = COOKIE_KEYS.ACCESS_TOKEN;
const REFRESH_TOKEN_KEY = COOKIE_KEYS.REFRESH_TOKEN;

function getMaxAgeFromToken(
  token: string,
  fallbackSeconds: number
): number {
  try {
    const decoded = decodeToken(token);
    if (decoded?.exp) {
      const now = Math.floor(Date.now() / 1000);
      const remaining = decoded.exp - now;
      if (remaining > 60) return remaining;
    }
  } catch {
    // ignore
  }
  return fallbackSeconds;
}

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60; // 1 Year (31,536,000s)

export function storeTokenRemember(token: string | undefined): void {
  if (typeof window === "undefined" || !token) {
    return;
  }
  const maxAge = ONE_YEAR_SECONDS;
  setCookie(ACCESS_TOKEN_KEY, token, { maxAge, path: "/" });
}

export function getToken(): string | undefined {
  const token = getCookie(ACCESS_TOKEN_KEY);
  return token as string | undefined;
}

export function storeToken(token: string | undefined, expiresIn?: number): void {
  if (typeof window === "undefined" || !token) {
    return;
  }
  const maxAge = expiresIn || ONE_YEAR_SECONDS;
  setCookie(ACCESS_TOKEN_KEY, token, { maxAge, path: "/" });
}

export function storeRefreshToken(_refreshToken?: string): void {
  // Refresh token cookie storage disabled per security policy - Access token only
}

export function getRefreshToken(): string | undefined {
  return undefined;
}

export function storeTokens(
  accessToken: string | undefined,
  _refreshToken?: string | undefined
): void {
  storeToken(accessToken);
}

export function clearToken(): void {
  deleteCookie(ACCESS_TOKEN_KEY);
}

export function clearRefreshToken(): void {
  deleteCookie(REFRESH_TOKEN_KEY);
}

export function clearAllTokens(): void {
  clearToken();
  deleteNativeCookie(COOKIE_KEYS.ADMIN_ACCESS_TOKEN);
}

export function storeAdminToken(token: string | undefined, expiresIn?: number): void {
  if (typeof window === "undefined" || !token) return;
  const maxAge = expiresIn || ONE_YEAR_SECONDS;
  setNativeCookie(COOKIE_KEYS.ADMIN_ACCESS_TOKEN, token, maxAge);
}

export function storeAdminRefreshToken(_refreshToken?: string): void {
  // Refresh token cookie storage disabled per security policy - Access token only
}

export function storeAdminTokens(
  accessToken: string | undefined,
  _refreshToken?: string | undefined
): void {
  storeAdminToken(accessToken);
}

export function getAdminToken(): string | undefined {
  return getCookie(COOKIE_KEYS.ADMIN_ACCESS_TOKEN) as string | undefined;
}

export function getAdminRefreshToken(): string | undefined {
  return undefined;
}

export function clearAdminTokens(): void {
  deleteNativeCookie(COOKIE_KEYS.ADMIN_ACCESS_TOKEN);
}

export function isAuthenticated(): boolean {
  const token = getCookie(ACCESS_TOKEN_KEY);
  return !!token;
}

export function hasRefreshToken(): boolean {
  return false;
}

export function decodeToken(token: string): {
  sub?: string;
  userId?: string;
  userType?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function isTokenExpired(bufferSeconds: number = 300): boolean {
  const token = getToken();
  if (!token) return true;

  const decoded = decodeToken(token as string);
  if (!decoded?.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime + bufferSeconds;
}

// Keep legacy export naming compatibility
export function logoutToken(): void {
  clearAllTokens();
}
