import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "./src/constants/AppRoutes/routes";

export default function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  const role = req.cookies.get("auth-roles")?.value;
  const pathname = req.nextUrl.pathname;

  // Allow static assets, next internal files, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public customer self-service route vs logged in user
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL(ROUTES.STAFF.OPENING, req.url));
    }
    return NextResponse.next();
  }

  // If visiting login page: redirect already authenticated users to staff opening
  if (pathname === "/login") {
    if (token) {
      return NextResponse.redirect(new URL(ROUTES.STAFF.OPENING, req.url));
    }
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!token) {
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
