"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignOutButton } from "./SignOutButton";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function PendingVerificationPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        // Not logged in or no valid session (GoTrue returns error if email not confirmed during login)
        // If they have no session, they shouldn't be on this page.
        router.push("/login");
        return;
      }

      if (data.session.user.email_confirmed_at) {
        // Already verified — send to dashboard
        router.push("/dashboard");
        return;
      }

      setUserEmail(data.session.user.email ?? null);
      setIsLoading(false);
    }
    
    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex-center z-content" style={{ minHeight: "100vh" }}>
        <div className="btn-spinner" style={{ width: "32px", height: "32px" }}></div>
      </div>
    );
  }

  return (
    <div className="flex-center z-content" style={{ minHeight: "100vh", padding: "2rem" }}>
      <div className="glass-panel text-center animate-fade-in-up" style={{ padding: "3rem", maxWidth: "480px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✉️</div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "1rem" }}>
          Verify your email
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem", lineHeight: 1.6 }}>
          We&apos;ve sent a verification link to{" "}
          <strong>{userEmail}</strong>.{" "}
          Please check your inbox and click the link to activate your account.
        </p>

        <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid var(--glass-border)", marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
            Didn&apos;t receive an email? Check your spam folder or{" "}
            <Link href="/login" className="text-link">return to login</Link>{" "}
            and try the new Resend button there!
          </p>
        </div>

        <SignOutButton />
      </div>
    </div>
  );
}
