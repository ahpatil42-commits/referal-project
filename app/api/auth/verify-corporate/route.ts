import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  try {
    const existingToken = await db.verificationToken.findFirst({
      where: { token }
    });

    if (!existingToken) {
      return new NextResponse("Invalid or expired token.", { status: 400 });
    }

    const hasExpired = new Date() > new Date(existingToken.expires);

    if (hasExpired) {
      return new NextResponse("Token has expired.", { status: 400 });
    }

    // Update the ReferrerProfile matching this corporateEmail
    const referrerProfile = await db.referrerProfile.findFirst({
      where: { corporateEmail: existingToken.identifier }
    });

    if (!referrerProfile) {
      return new NextResponse("Corporate email not associated with any referrer profile.", { status: 400 });
    }

    await db.referrerProfile.update({
      where: { id: referrerProfile.id },
      data: { isVerified: true }
    });

    await db.verificationToken.deleteMany({
      where: { token: existingToken.token }
    });

    // Redirect to a success page or login
    return NextResponse.redirect(new URL("/dashboard/referrer/profile?verified=true", request.url));
  } catch (error) {
    import('@/lib/logger').then(({ logger }) => {
      logger.error({ msg: '[VERIFY_CORPORATE]', error });
    });
    return new NextResponse("Internal error", { status: 500 });
  }
}
