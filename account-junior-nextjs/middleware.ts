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

  // Public customer self-service route — no auth required
  if (pathname === "/") {
    return NextResponse.next();
  }

  // If visiting login page: redirect already authenticated users to their home
  if (pathname === "/login") {
    if (token) {
      if (role === "STAFF") {
        return NextResponse.redirect(new URL(ROUTES.STAFF.OPENING, req.url));
      }
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD.INDEX, req.url));
    }
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!token) {
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // STAFF role: restricted exclusively to staff-opening route
  if (role === "STAFF") {
    if (pathname === ROUTES.STAFF.OPENING) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(ROUTES.STAFF.OPENING, req.url));
  }

  // Non-STAFF role (Admins) trying to access staff opening route -> redirect to dashboard
  if (pathname === ROUTES.STAFF.OPENING) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD.INDEX, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
