import { Resend } from "resend";
import { getBaseUrl } from "./url";
import { logger } from "./logger";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const baseUrl = getBaseUrl();

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  if (!resend) {
    logger.info({
      devMessage: "EMAIL VERIFICATION LINK (DEV MODE)",
      verifyUrl,
    });
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
    logger.error({ msg: "RESEND ERROR - VERIFICATION", error });
  } else {
    logger.info({ msg: "RESEND SUCCESS - VERIFICATION", data });
  }
}

export async function sendOTPEmail(email: string, otp: string) {
  if (!resend) {
    logger.info({ devMessage: "EMAIL OTP (DEV MODE)", otp });
    return;
  }

  const { data, error } = await resend.emails.send({
    from: fromEmail,
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

  if (error) {
    logger.error({ msg: "RESEND ERROR - OTP", error });
  } else {
    logger.info({ msg: "RESEND SUCCESS - OTP", data });
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  if (!resend) {
    logger.info({ devMessage: "PASSWORD RESET LINK (DEV MODE)", resetUrl });
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
    logger.error({ msg: "RESEND ERROR - PASSWORD RESET", error });
  } else {
    logger.info({ msg: "RESEND SUCCESS - PASSWORD RESET", data });
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
    logger.info({ msg: 'Mail: Corporate verification email sent', email });
  } catch (error) {
    logger.error({ msg: 'Mail: Failed to send corporate verification email', email, error });
  }
}

/**
 * Sends a rich HTML notification email (e.g. referral accepted, new request).
 * Falls back gracefully when RESEND_API_KEY is not set.
 */
export async function sendEmailNotification(to: string, subject: string, text: string) {
  if (!resend) {
    logger.warn({ msg: 'Mail: RESEND_API_KEY not set. Skipping notification email.' });
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
    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    logger.error({ msg: 'Mail: Failed to send notification email', error });
  }
}
