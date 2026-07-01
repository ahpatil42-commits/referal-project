import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email address." }, { status: 404 });
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
    // Send Reset Email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    import('@/lib/logger').then(({ logger }) => {
      logger.error({ msg: '[FORGOT_PASSWORD_ERROR]', error });
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
