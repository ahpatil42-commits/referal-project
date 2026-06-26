import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * GET /api/profile/avatar
 *
 * Returns the current user's avatar URL.
 * Image is fetched fresh from the DB and never stored in the JWT/session
 * cookie, preventing 494 REQUEST_HEADER_TOO_LARGE errors on Vercel.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { image: true },
  });

  // If the stored image is a Base64 data URI (legacy), return null
  // so the UI falls back to a default avatar. The user should re-upload
  // to get a proper Vercel Blob URL.
  const image = user?.image;
  const isBase64 = image?.startsWith("data:");
  
  return NextResponse.json({
    imageUrl: isBase64 ? null : (image ?? null),
    isLegacyBase64: isBase64 ?? false,
  });
}
