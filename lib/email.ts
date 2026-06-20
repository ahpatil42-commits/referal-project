import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function sendEmailNotification(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set. Skipping email send.");
    return;
  }

  try {
    await resend.emails.send({
      from: "ReferralAI <noreply@referralai.com>",
      to,
      subject,
      text, // We can also add HTML if we want, but the existing code passes text
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>${subject}</h2>
          <p style="white-space: pre-wrap;">${text}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
