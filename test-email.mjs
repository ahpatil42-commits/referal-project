import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error("No RESEND_API_KEY found in .env");
  process.exit(1);
}

const resend = new Resend(resendApiKey);

async function testEmail() {
  console.log("Attempting to send email via Resend...");
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "ahpatil0102@gmail.com",
      subject: "Test from ReferralAI Backend",
      html: "<p>If you see this, the Resend integration works!</p>",
    });

    console.log("Response from Resend:", JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error("Resend API returned an error:", data.error);
    } else {
      console.log("Email sent successfully!");
    }
  } catch (error) {
    console.error("Exception thrown while sending email:", error);
  }
}

testEmail();
