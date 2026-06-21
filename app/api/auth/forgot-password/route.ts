import { NextResponse } from "next/response";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak whether the email exists
      return NextResponse.json({ success: true });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: email,
          token
        }
      },
      update: { token, expires },
      create: { identifier: email, token, expires }
    });

    // In a production app, use Resend/Nodemailer to send the email.
    // Since we don't have a configured SMTP/RESEND_API_KEY in the environment,
    // we log the reset link to the console for development testing.
    console.log(`\n\n================================`);
    console.log(`🔐 PASSWORD RESET LINK (DEV MODE)`);
    console.log(`http://localhost:3000/reset-password?token=${token}&email=${encodeURIComponent(email)}`);
    console.log(`================================\n\n`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
