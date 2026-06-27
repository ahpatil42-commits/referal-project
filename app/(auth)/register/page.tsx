"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const RegisterSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[0-9]/, { message: "Password must contain at least 1 number" }),
    countryCode: z.string().optional(),
    mobile: z.string().optional().refine((val) => !val || /^[0-9]{7,15}$/.test(val), {
      message: "Mobile number must be between 7 and 15 digits",
    }),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Terms and Conditions",
    }),
  });

type RegisterFormValues = z.infer<typeof RegisterSchema>;



export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      countryCode: "+1",
      mobile: "",
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    setServerSuccess(null);

    const fullMobile = data.mobile ? `${data.countryCode}${data.mobile}` : undefined;

    // 1. Sign up via Supabase — this sends the confirmation email automatically
    const supabase = createClient();
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { role: "SEEKER" },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (signUpError) {
      setServerError(signUpError.message);
      return;
    }

    // 2. Also create the Prisma DB record (profile, role, mobile etc.)
    const response = await registerUser({ ...data, mobile: fullMobile, role: "SEEKER" });

    if (response.error) {
      setServerError(response.error);
      return;
    }

    // 3. Show the "check your email" message
    setServerSuccess("Account created! Please check your email to verify your account before logging in.");
  };

  const signInWithOAuth = async (provider: "google" | "linkedin_oidc" | "facebook") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  return (
    <div
      className="flex-center z-content"
      style={{
        minHeight: "100vh",
        padding: "2rem 1.5rem",
      }}
    >
      {/* Ambient glow orbs */}
      <div
        className="glow-ring"
        style={{
          width: "600px",
          height: "600px",
          background: "var(--color-accent)",
          top: "-250px",
          right: "-200px",
          opacity: 0.04,
        }}
      />
      <div
        className="glow-ring"
        style={{
          width: "500px",
          height: "500px",
          background: "var(--color-primary)",
          bottom: "-200px",
          left: "-200px",
          opacity: 0.06,
        }}
      />

      {/* Card */}
      <div
        className="glass-panel animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "2.5rem",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <Link
            href="/"
            className="logo-badge"
            style={{
              justifyContent: "center",
              display: "inline-flex",
              textDecoration: "none",
              marginBottom: "1rem",
            }}
          >
            <div className="logo-icon">✦</div>
            <span>ReferralAI</span>
          </Link>
          <h1
            style={{
              fontSize: "1.625rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginTop: "1rem",
            }}
          >
            Create your account
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.375rem",
            }}
          >
            Join thousands building their dream careers
          </p>
        </div>

        {/* Alerts */}
        {serverError && (
          <div
            className="alert-error animate-fade-in"
            style={{ marginBottom: "1.25rem" }}
          >
            <span>⚠</span>
            <span>{serverError}</span>
          </div>
        )}
        {serverSuccess && (
          <div
            className="alert-success animate-fade-in"
            style={{ marginBottom: "1.25rem" }}
          >
            <span>✓</span>
            <span>{serverSuccess} Redirecting to login...</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >


          {/* Personal Email */}
          <div>
            <label htmlFor="register-email" className="form-label">
              Personal Email
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="form-error">
                <span>✕</span> {errors.email.message}
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="register-mobile" className="form-label">
              Mobile Number <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", fontWeight: 400 }}>(Optional)</span>
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <select
                {...register("countryCode")}
                className="form-input"
                style={{ width: "90px", padding: "0 0.5rem", flexShrink: 0 }}
              >
                <option value="+1">+1 (US/CA)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+91">+91 (IN)</option>
                <option value="+61">+61 (AU)</option>
                <option value="+49">+49 (DE)</option>
                <option value="+86">+86 (CN)</option>
                <option value="+81">+81 (JP)</option>
              </select>
              <input
                id="register-mobile"
                type="tel"
                className={`form-input ${errors.mobile ? "error" : ""}`}
                placeholder="1234567890"
                style={{ flex: 1 }}
                {...register("mobile")}
              />
            </div>
          </div>



          {/* Password */}
          <div>
            <label htmlFor="register-password" className="form-label">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="Min. 6 characters"
              {...register("password")}
            />
            {errors.password && (
              <p className="form-error">
                <span>✕</span> {errors.password.message}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="register-terms"
              {...register("terms")}
              style={{ marginTop: "0.25rem" }}
            />
            <label htmlFor="register-terms" style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              I agree to the <Link href="/terms" className="text-link" target="_blank">Terms of Service</Link> and <Link href="/privacy" className="text-link" target="_blank">Privacy Policy</Link>.
            </label>
          </div>
          {errors.terms && (
            <p className="form-error" style={{ marginTop: "-0.5rem" }}>
              <span>✕</span> {errors.terms.message}
            </p>
          )}

          {/* Submit */}
          <button
            id="register-submit"
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || !!serverSuccess}
            style={{ marginTop: "0.25rem" }}
          >
              "Create Account"
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0", color: "var(--color-text-muted)" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }} />
          {/* <span style={{ padding: "0 0.75rem", fontSize: "0.875rem" }}>or continue with</span> */}
          <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button onClick={() => signInWithOAuth("google")} className="btn-secondary" style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={() => signInWithOAuth("linkedin_oidc")} className="btn-secondary" style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              LinkedIn
            </button>
            <button onClick={() => signInWithOAuth("facebook")} className="btn-secondary" style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            marginTop: "1.75rem",
          }}
        >
          Already have an account?{" "}
          <Link href="/login" className="text-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
