import { NextResponse } from "next/server";

/**
 * DISABLED: This endpoint previously stored profile photos as Base64 data URIs
 * directly in the database. That caused Vercel's 494 REQUEST_HEADER_TOO_LARGE
 * error because the image data leaked into the NextAuth session cookie on every
 * request, blowing past the 8 KB header limit.
 *
 * Profile photo uploads now go through /api/upload (Vercel Blob) with
 * clientPayload: 'avatar'. The blob URL (a short https:// string) is stored
 * in user.image instead of a multi-KB Base64 string.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This endpoint is disabled. Use /api/upload with clientPayload='avatar' instead.",
    },
    { status: 410 } // 410 Gone
  );
}
