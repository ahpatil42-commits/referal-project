"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyOTP } from "@/actions/verify-otp";

function VerifyOTPForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const email = searchParams.get("email");
  const mobile = searchParams.get("mobile");

  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!email) {
    return (
      <div style={{ textAlign: "center", color: "var(--color-text-primary)" }}>
        <p>Missing email parameter.</p>
        <Link href="/register" className="text-link">Back to Registration</Link>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);
    setIsSubmitting(true);

    if (emailOtp.length !== 6) {
      setServerError("Email OTP must be 6 digits.");
      setIsSubmitting(false);
      return;
    }
    if (mobile && mobileOtp.length !== 6) {
      setServerError("Mobile OTP must be 6 digits.");
      setIsSubmitting(false);
      return;
    }

    const response = await verifyOTP({ email, mobile: mobile || undefined, emailOtp, mobileOtp: mobile ? mobileOtp : undefined });

    if (response.error) {
      setServerError(response.error);
    } else if (response.success) {
      setServerSuccess(response.success);
      setTimeout(() => router.push("/login"), 2000);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div
      className="glass-panel animate-fade-in-up"
      style={{
        width: "100%",
        maxWidth: "480px",
        padding: "2.5rem",
        zIndex: 10,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.625rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Verify Your Account
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginTop: "0.375rem" }}>
          We sent a 6-digit code to <strong>{email}</strong>
          {mobile && <span> and <strong>{mobile}</strong></span>}.
        </p>
      </div>

      {serverError && (
        <div className="alert-error animate-fade-in" style={{ marginBottom: "1.25rem" }}>
          <span>⚠</span>
          <span>{serverError}</span>
        </div>
      )}
      {serverSuccess && (
        <div className="alert-success animate-fade-in" style={{ marginBottom: "1.25rem" }}>
          <span>✓</span>
          <span>{serverSuccess} Redirecting to login...</span>
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <label htmlFor="email-otp" className="form-label">Email Verification Code</label>
          <input
            id="email-otp"
            type="text"
            maxLength={6}
            className="form-input"
            placeholder="123456"
            value={emailOtp}
            onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, ""))}
            required
            style={{ letterSpacing: "0.2em", textAlign: "center", fontSize: "1.25rem", fontWeight: 600 }}
          />
        </div>

        {mobile && (
          <div>
            <label htmlFor="mobile-otp" className="form-label">Mobile Verification Code</label>
            <input
              id="mobile-otp"
              type="text"
              maxLength={6}
              className="form-input"
              placeholder="123456"
              value={mobileOtp}
              onChange={(e) => setMobileOtp(e.target.value.replace(/[^0-9]/g, ""))}
              required
              style={{ letterSpacing: "0.2em", textAlign: "center", fontSize: "1.25rem", fontWeight: 600 }}
            />
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || !!serverSuccess}
          style={{ marginTop: "0.5rem" }}
        >
          {isSubmitting ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <div className="flex-center z-content" style={{ minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <div className="glow-ring" style={{ width: "600px", height: "600px", background: "var(--color-accent)", top: "-250px", right: "-200px", opacity: 0.04 }} />
      <div className="glow-ring" style={{ width: "500px", height: "500px", background: "var(--color-primary)", bottom: "-200px", left: "-200px", opacity: 0.06 }} />
      <Suspense fallback={<div style={{ color: "var(--color-text-primary)" }}>Loading...</div>}>
        <VerifyOTPForm />
      </Suspense>
    </div>
  );
}
