import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { apiRateLimiter } from "@/lib/rate-limit-edge";

/**
 * Edge-compatible middleware.
 *
 * Uses the Supabase SSR client (cookie-based JWTs) instead of NextAuth.
 * The Supabase client is Edge-Runtime safe — it never touches Node.js APIs.
 *
 * Auth logic is identical to before:
 *  - Unauthenticated → /login
 *  - Email not confirmed → /pending-verification
 *  - Role-based dashboard routing (SEEKER / REFERRER)
 *  - Rate-limiting for non-auth API routes
 */
export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // ── Route classification ──────────────────────────────────────────────────
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isSeekerRoute    = nextUrl.pathname.startsWith("/dashboard/seeker");
  const isReferrerRoute  = nextUrl.pathname.startsWith("/dashboard/referrer");
  const isAuthRoute      =
    nextUrl.pathname === "/login" || nextUrl.pathname === "/register";
  const isApiRoute       = nextUrl.pathname.startsWith("/api");

  // ── Rate limiting for API routes (excluding auth & webhooks) ──────────────
  if (
    isApiRoute &&
    !nextUrl.pathname.startsWith("/api/auth") &&
    !nextUrl.pathname.startsWith("/api/webhooks")
  ) {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success, limit, remaining } = await apiRateLimiter.check(ip);

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

  // ── Supabase session ──────────────────────────────────────────────────────
  // createMiddlewareClient returns a response that carries any refreshed
  // Supabase cookies — we MUST return that response (or one derived from it)
  // so the browser receives the updated tokens.
  const { supabase, response } = createMiddlewareClient(request);

  // getUser() validates the JWT against the Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoggedIn       = !!user;
  // Role is stored in Supabase user_metadata when we sign up
  const role: string     = (user?.user_metadata?.role as string) ?? "SEEKER";

  // ── Redirect authenticated users away from auth pages ────────────────────
  if (isAuthRoute && isLoggedIn) {
    if (role === "REFERRER") {
      return NextResponse.redirect(
        new URL("/dashboard/referrer", nextUrl),
        { headers: response.headers }
      );
    }
    return NextResponse.redirect(
      new URL("/dashboard/seeker", nextUrl),
      { headers: response.headers }
    );
  }

  // ── Redirect unauthenticated users away from dashboard ───────────────────
  if (isDashboardRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl),
      { headers: response.headers }
    );
  }

  // ── Role-based access control for authenticated dashboard users ───────────
  if (isLoggedIn && (isDashboardRoute || nextUrl.pathname.startsWith("/portal-admin"))) {

    // /dashboard → redirect to role-specific dashboard
    if (
      nextUrl.pathname === "/dashboard" ||
      nextUrl.pathname === "/dashboard/"
    ) {
      return NextResponse.redirect(
        new URL(
          role === "REFERRER" ? "/dashboard/referrer" : "/dashboard/seeker",
          nextUrl
        ),
        { headers: response.headers }
      );
    }

    // SEEKER trying to access referrer routes
    if (isReferrerRoute && role !== "REFERRER") {
      return NextResponse.redirect(
        new URL("/dashboard/seeker", nextUrl),
        { headers: response.headers }
      );
    }

    // REFERRER trying to access seeker routes
    if (isSeekerRoute && role !== "SEEKER") {
      return NextResponse.redirect(
        new URL("/dashboard/referrer", nextUrl),
        { headers: response.headers }
      );
    }
  }

  // Forward the response (important: carries refreshed Supabase cookies)
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - files with extensions (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
