import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "./SignOutButton";

export default async function PendingVerificationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // emailVerified is manually populated in auth.ts 
  if (session.user.emailVerified) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-center z-content" style={{ minHeight: "100vh", padding: "2rem" }}>
      <div className="glass-panel text-center animate-fade-in-up" style={{ padding: "3rem", maxWidth: "480px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✉️</div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "1rem" }}>
          Verify your email
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
          We've sent a verification link to <strong>{session.user.email}</strong>.
          Please check your inbox (and terminal console) and click the link to activate your account.
        </p>

        <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid var(--glass-border)", marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
            <strong>Developer Note:</strong> Since this is running locally without an SMTP provider, the verification link was printed to your terminal console running <code style={{ color: "var(--color-primary-light)" }}>npm run dev</code>.
          </p>
        </div>

        <SignOutButton />
      </div>
    </div>
  );
}
