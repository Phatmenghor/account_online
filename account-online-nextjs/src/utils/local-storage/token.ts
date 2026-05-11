import { deleteCookie, getCookie, setCookie } from "cookies-next";

// Token expiration time in seconds (1 hour = 3600 seconds)
const DEFAULT_TOKEN_EXPIRY = 3600;

interface TokenData {
  token: string;
  expiresAt: number;
}

export function storeTokenRemember(token: string | undefined): void {
  if (typeof window === "undefined") {
    return;
  }

  // Remember token for 365 days
  const rememberMaxAge = 365 * 24 * 60 * 60;
  setCookie("auth-token", token, { maxAge: rememberMaxAge });
  setCookie("auth-token-expires", String(Date.now() + rememberMaxAge * 1000));
}

export function getToken() {
  const token = getCookie("auth-token");
  if (!token) return null;

  // Check if token has expired
  if (isTokenExpired()) {
    logoutToken();
    return null;
  }

  return token;
}

export function storeToken(token: string | undefined, expiresIn?: number): void {
  if (typeof window === "undefined") {
    return;
  }

  const maxAge = expiresIn || DEFAULT_TOKEN_EXPIRY;
  setCookie("auth-token", token, { maxAge });
  setCookie("auth-token-expires", String(Date.now() + maxAge * 1000));
}

export function storeRefreshToken(token: string | undefined, expiresIn?: number): void {
  if (typeof window === "undefined") {
    return;
  }

  // Refresh token typically lasts longer (7 days)
  const maxAge = expiresIn || 7 * 24 * 60 * 60;
  setCookie("refresh-token", token, { maxAge });
  setCookie("refresh-token-expires", String(Date.now() + maxAge * 1000));
}

export function getRefreshToken() {
  const token = getCookie("refresh-token");
  if (!token) return null;

  // Check if refresh token has expired
  if (isRefreshTokenExpired()) {
    logoutToken();
    return null;
  }

  return token;
}

/**
 * Check if access token is expired
 */
export function isTokenExpired(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const expiresAt = getCookie("auth-token-expires");
  if (!expiresAt) return true;

  return Date.now() > parseInt(expiresAt as string);
}

/**
 * Check if refresh token is expired
 */
export function isRefreshTokenExpired(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const expiresAt = getCookie("refresh-token-expires");
  if (!expiresAt) return true;

  return Date.now() > parseInt(expiresAt as string);
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpiresAt(): number | null {
  const expiresAt = getCookie("auth-token-expires");
  return expiresAt ? parseInt(expiresAt as string) : null;
}

/**
 * Logout the current user
 */
export function logoutToken(): void {
  // Delete auth cookies
  deleteCookie("auth-token");
  deleteCookie("auth-token-expires");
  deleteCookie("refresh-token");
  deleteCookie("refresh-token-expires");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getCookie("auth-token");
  if (!token) return false;

  // Check if token is expired
  return !isTokenExpired();
}
