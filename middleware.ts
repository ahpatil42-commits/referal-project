import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiRateLimiter } from "@/lib/rate-limit-edge";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role: string | undefined = req.auth?.user?.role;

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isSeekerRoute = nextUrl.pathname.startsWith("/dashboard/seeker");
  const isReferrerRoute = nextUrl.pathname.startsWith("/dashboard/referrer");
  const isAuthRoute =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/register";
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // Rate Limiting for API routes (excluding auth and webhooks)
  if (isApiRoute && !nextUrl.pathname.startsWith("/api/auth") && !nextUrl.pathname.startsWith("/api/webhooks")) {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success, limit, remaining } = apiRateLimiter.check(ip);
    
    if (!success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      });
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    // Enforce email verification requirement
    if (!req.auth?.user?.emailVerified) {
      return NextResponse.redirect(new URL("/pending-verification", nextUrl));
    }
    if (role === "REFERRER") {
      return NextResponse.redirect(new URL("/dashboard/referrer", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard/seeker", nextUrl));
  }

  // Redirect unauthenticated users trying to access dashboard
  if (isDashboardRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // Role-based access control for authenticated users on dashboard routes
  if (isLoggedIn && (isDashboardRoute || nextUrl.pathname.startsWith("/portal-admin"))) {
    // Enforce email verification requirement
    if (!req.auth?.user?.emailVerified) {
      return NextResponse.redirect(new URL("/pending-verification", nextUrl));
    }

    // Redirect generic /dashboard → role-specific dashboard
    if (
      nextUrl.pathname === "/dashboard" ||
      nextUrl.pathname === "/dashboard/"
    ) {
      if (role === "REFERRER") {
        return NextResponse.redirect(
          new URL("/dashboard/referrer", nextUrl)
        );
      }
      return NextResponse.redirect(new URL("/dashboard/seeker", nextUrl));
    }

    // SEEKER trying to access referrer routes → redirect to their dashboard
    if (isReferrerRoute && role !== "REFERRER") {
      return NextResponse.redirect(new URL("/dashboard/seeker", nextUrl));
    }

    // REFERRER trying to access seeker routes → redirect to their dashboard
    if (isSeekerRoute && role !== "SEEKER") {
      return NextResponse.redirect(new URL("/dashboard/referrer", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - api/uploadthing (UploadThing webhooks)
     * - files with extensions (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/uploadthing|.*\\..*).*)",
  ],
};
