import { Resend } from "resend";
import nodemailer from "nodemailer";
import { getBaseUrl } from "./url";

// ── Resend (optional) ─────────────────────────────────────────────────────────
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// ── Gmail SMTP via Nodemailer (primary — no domain needed) ───────────────────
// Setup: https://myaccount.google.com/apppasswords (2FA must be enabled)
// Add to .env: GMAIL_USER=you@gmail.com  GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
const gmailTransport =
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    : null;

const gmailFrom = process.env.GMAIL_USER
  ? `ReferralAI <${process.env.GMAIL_USER}>`
  : null;

const baseUrl = getBaseUrl();

// ── Helper: send via Gmail first, fall back to Resend ─────────────────────────
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // 1️⃣ Try Gmail SMTP
  if (gmailTransport && gmailFrom) {
    await gmailTransport.sendMail({ from: gmailFrom, to, subject, html });
    console.log(`[Mail] Sent via Gmail to ${to}`);
    return;
  }

  // 2️⃣ Fall back to Resend (requires verified domain for non-owner emails)
  if (resend) {
    const { error } = await resend.emails.send({ from: fromEmail, to, subject, html });
    if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
    console.log(`[Mail] Sent via Resend to ${to}`);
    return;
  }

  // 3️⃣ Dev fallback — print to console
  console.log(`\n[DEV - NO MAIL PROVIDER] Would send "${subject}" to ${to}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  if (!gmailTransport && !resend) {
    console.log("\n=============================================");
    console.log("   📧 EMAIL VERIFICATION LINK (DEV MODE)   ");
    console.log("=============================================");
    console.log(`Click to verify: ${verifyUrl}`);
    console.log("=============================================\n");
    return;
  }

  await sendEmail({
    to: email,
    subject: "Verify your ReferralAI account",
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ReferralAI!</h2>
        <p>You're almost there. Please verify your email address to activate your account.</p>
        <div style="margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendOTPEmail(email: string, otp: string) {
  if (!gmailTransport && !resend) {
    console.log("\n=============================================");
    console.log("   📧 EMAIL OTP (DEV MODE)   ");
    console.log("=============================================");
    console.log(`Your verification code is: ${otp}`);
    console.log("=============================================\n");
    return;
  }

  await sendEmail({
    to: email,
    subject: "Your ReferralAI Verification Code",
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Your 6-digit verification code is:</p>
        <div style="margin: 30px 0;">
          <strong style="font-size: 24px; letter-spacing: 4px; padding: 12px 24px; background: #f3f4f6; border-radius: 6px;">
            ${otp}
          </strong>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  if (!gmailTransport && !resend) {
    console.log("\n=============================================");
    console.log("   🔐 PASSWORD RESET LINK (DEV MODE)   ");
    console.log("=============================================");
    console.log(`Click to reset: ${resetUrl}`);
    console.log("=============================================\n");
    return;
  }

  await sendEmail({
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
}

export async function sendCorporateVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/verify-corporate?token=${token}`;

  if (!gmailTransport && !resend) {
    console.log(`\n[DEV] Corporate verification link for ${email}:\n${verificationLink}\n`);
    return { sent: false, devLink: verificationLink };
  }

  try {
    await sendEmail({
      to: email,
      subject: "Verify your Corporate Email on ReferralAI",
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2>Verify Corporate Email</h2>
          <p>To get the Verified Blue Checkmark on your Referrer Profile, please verify your corporate email:</p>
          <div style="margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Verify Corporate Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    return { sent: true };
  } catch (error) {
    console.error(`[Mail] Failed to send corporate verification email to ${email}:`, error);
    return { sent: false };
  }
}

/**
 * Sends a rich HTML notification email (e.g. referral accepted, new request).
 */
export async function sendEmailNotification(to: string, subject: string, text: string) {
  if (!gmailTransport && !resend) {
    console.warn("[Mail] No mail provider configured. Skipping notification email.");
    return;
  }

  const html = `
    <div style="font-family: sans-serif; background:#0B0B14; padding: 40px 0;">
      <div style="margin: 0 auto; padding: 20px; background: #11111A; border: 1px solid #1F1F2E; border-radius: 12px; max-width: 600px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #1F1F2E;">
          <p style="font-size: 24px; font-weight: bold; color: #ffffff; margin: 0;">ReferralAI</p>
        </div>
        <div style="padding: 20px 0;">
          <p style="font-size: 20px; font-weight: bold; color: #ffffff; margin-bottom: 16px;">${subject}</p>
          <p style="font-size: 16px; line-height: 24px; color: #A0AEC0; white-space: pre-wrap;">${text}</p>
        </div>
        <div style="text-align: center; padding-top: 20px;">
          <a href="${baseUrl}/dashboard"
             style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    await sendEmail({ to, subject, html });
  } catch (error) {
    console.error("[Mail] Failed to send notification email:", error);
  }
}
