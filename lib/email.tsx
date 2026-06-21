import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { Html, Head, Preview, Body, Container, Section, Text, Button } from "@react-email/components";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

function EmailTemplate({ subject, text }: { subject: string; text: string }) {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <Body style={{ backgroundColor: "#0B0B14", color: "#E2E8F0", fontFamily: "sans-serif" }}>
        <Container style={{ margin: "40px auto", padding: "20px", backgroundColor: "#11111A", border: "1px solid #1F1F2E", borderRadius: "12px", maxWidth: "600px" }}>
          <Section style={{ textAlign: "center", paddingBottom: "20px", borderBottom: "1px solid #1F1F2E" }}>
            <Text style={{ fontSize: "24px", fontWeight: "bold", color: "#ffffff", margin: 0 }}>
              ReferralAI
            </Text>
          </Section>
          <Section style={{ padding: "20px 0" }}>
            <Text style={{ fontSize: "20px", fontWeight: "bold", color: "#ffffff", marginBottom: "16px" }}>
              {subject}
            </Text>
            <Text style={{ fontSize: "16px", lineHeight: "24px", color: "#A0AEC0", whiteSpace: "pre-wrap" }}>
              {text}
            </Text>
          </Section>
          <Section style={{ textAlign: "center", paddingTop: "20px" }}>
            <Button
              href="https://referralai.com/dashboard"
              style={{
                backgroundColor: "#6366f1",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold",
                display: "inline-block"
              }}
            >
              Go to Dashboard
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function sendEmailNotification(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_dummy") {
    console.warn("RESEND_API_KEY not set. Skipping email send.");
    return;
  }

  try {
    const htmlContent = await render(React.createElement(EmailTemplate, { subject, text }));

    await resend.emails.send({
      from: "ReferralAI <noreply@referralai.com>", // You must verify this domain in Resend
      to,
      subject,
      text, // fallback
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
