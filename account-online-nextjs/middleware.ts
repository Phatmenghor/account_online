// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "./src/constants/AppRoutes/routes";

export default function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  const role = req.cookies.get("auth-roles")?.value;
  const pathname = req.nextUrl.pathname;

  // Always allow login page
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // STAFF role: only allowed on "/", redirect everything else to login
  if (token && role === "STAFF") {
    if (pathname === "/") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, req.url));
  }

  // Root "/" for non-STAFF authenticated users: redirect to dashboard
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD.INDEX, req.url));
    }
    return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, req.url));
  }

  // Protect all other routes: require token
  if (!token) {
    const loginUrl = new URL(ROUTES.AUTH.LOGIN, req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Apply middleware to all routes except _next, static files, and api routes if needed
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
