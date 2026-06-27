import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Creates a Supabase SSR client that can read/write cookies from a Next.js
 * Edge middleware request/response pair.
 *
 * Returns both the supabase client and the (potentially updated) response so
 * the caller can forward refreshed auth cookies to the browser.
 */
export function createMiddlewareClient(request: NextRequest) {
  // We start with a plain NextResponse.next() and let the Supabase client
  // mutate its cookies when it needs to refresh a token.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
}
