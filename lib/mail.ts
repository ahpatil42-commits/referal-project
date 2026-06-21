import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  if (!resend) {
    console.log("\n=============================================");
    console.log("   📧 EMAIL VERIFICATION LINK (DEV MODE)   ");
    console.log("=============================================");
    console.log(`Click to verify: ${verifyUrl}`);
    console.log("=============================================\n");
    return;
  }

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Verify your ReferralAI account",
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ReferralAI!</h2>
        <p>You're almost there. Please verify your email address to activate your account and access the dashboard.</p>
        <div style="margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("[RESEND ERROR - VERIFICATION]:", error);
  } else {
    console.log("[RESEND SUCCESS - VERIFICATION]:", data);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  if (!resend) {
    console.log("\n=============================================");
    console.log("   🔐 PASSWORD RESET LINK (DEV MODE)   ");
    console.log("=============================================");
    console.log(`Click to reset: ${resetUrl}`);
    console.log("=============================================\n");
    return;
  }

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Reset your ReferralAI password",
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to choose a new password.</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("[RESEND ERROR - PASSWORD RESET]:", error);
  } else {
    console.log("[RESEND SUCCESS - PASSWORD RESET]:", data);
  }
}

export async function sendCorporateVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-corporate?token=${token}`;
  
  try {
    await resend?.emails.send({
      from: fromEmail,
      to: email,
      subject: "Verify your Corporate Email on ReferralAI",
      html: `
        <h2>Verify Corporate Email</h2>
        <p>To get the Verified Blue Checkmark on your Referrer Profile, please verify your corporate email by clicking the link below:</p>
        <p><a href="${verificationLink}">Verify Corporate Email</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `
    });
    console.log(`[Mail] Corporate verification email sent to ${email}`);
  } catch (error) {
    console.error(`[Mail] Failed to send corporate verification email to ${email}:`, error);
  }
}
