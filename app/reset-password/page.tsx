"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  // Supabase puts the access_token + refresh_token in the URL hash after the
  // user clicks the reset link. We exchange them for a session here so that
  // updateUser() works.
  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          setSessionReady(true);
        } else if (!session) {
          setSessionError(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw new Error(error.message);

        toast.success("Password reset successfully! You can now log in.");
        await supabase.auth.signOut();
        router.push("/login");
      } catch (err: any) {
        toast.error(err.message || "Failed to reset password");
      }
    });
  };

  if (sessionError) {
    return (
      <div style={{ textAlign: "center", color: "var(--color-error, #ef4444)" }}>
        <p>This reset link has expired or is invalid.</p>
        <Link
          href="/forgot-password"
          style={{ color: "var(--color-primary-light)", marginTop: "1rem", display: "inline-block" }}
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>
        <Loader2 className="animate-spin" style={{ margin: "0 auto 1rem" }} />
        <p style={{ fontSize: "0.9rem" }}>Validating your reset link…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", textAlign: "left" }}>
      <div>
        <label className="form-label">New Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          placeholder="••••••••"
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <label className="form-label">Confirm New Password</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="form-input"
          placeholder="••••••••"
          style={{ width: "100%" }}
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !password || !confirmPassword}
        className="btn-primary"
        style={{ padding: "0.875rem", fontSize: "1rem", marginTop: "0.5rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}
      >
        {isPending ? <Loader2 className="animate-spin" /> : <>Reset Password <ArrowRight size={18} /></>}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-space" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", flexDirection: "column" }}>
      <div className="glass-panel animate-fade-in-up" style={{ width: "100%", maxWidth: "450px", padding: "3rem", textAlign: "center" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary-light)", marginBottom: "0.5rem" }}>
            Set New Password
          </h1>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
            Please enter your new password below.
          </p>
        </div>

        <Suspense fallback={<Loader2 className="animate-spin mx-auto" style={{ color: "var(--color-text-muted)" }} />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
