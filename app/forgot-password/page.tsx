"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { forgotPassword } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    startTransition(async () => {
      try {
        const response = await forgotPassword(email);

        if (response.error) {
          throw new Error(response.error);
        }

        setIsSubmitted(true);
        toast.success("Reset link sent to your email address!");
      } catch (err: any) {
        toast.error(err.message || "Failed to send reset link");
      }
    });
  };

  return (
    <div className="bg-space" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", flexDirection: "column" }}>
      
      <Link href="/login" style={{ position: "absolute", top: "2rem", left: "2rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-text-muted)", textDecoration: "none", fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Login
      </Link>

      <div className="glass-panel animate-fade-in-up" style={{ width: "100%", maxWidth: "450px", padding: "3rem", textAlign: "center" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary-light)", marginBottom: "0.5rem" }}>
            Forgot Password?
          </h1>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
            {isSubmitted 
              ? "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder." 
              : "Enter the email address associated with your account and we'll send you a link to reset your password."}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", textAlign: "left" }}>
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="you@example.com"
                style={{ width: "100%" }}
              />
            </div>
            <button
              type="submit"
              disabled={isPending || !email}
              className="btn-primary"
              style={{ padding: "0.875rem", fontSize: "1rem", marginTop: "0.5rem", display: "flex", justifyContent: "center" }}
            >
              {isPending ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <button
            onClick={() => { setIsSubmitted(false); setEmail(""); }}
            className="btn-secondary-hover"
            style={{ padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "99px", border: "1px solid var(--glass-border)", color: "white", cursor: "pointer" }}
          >
            Try another email
          </button>
        )}
      </div>
    </div>
  );
}
