"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="flex-center z-content"
      style={{
        minHeight: "100vh",
        padding: "1.5rem",
      }}
    >
      {/* Ambient glow orbs */}
      <div
        className="glow-ring"
        style={{
          width: "500px",
          height: "500px",
          background: "var(--color-primary)",
          top: "-200px",
          left: "-200px",
          opacity: 0.06,
        }}
      />
      <div
        className="glow-ring"
        style={{
          width: "400px",
          height: "400px",
          background: "var(--color-purple)",
          bottom: "-150px",
          right: "-150px",
          opacity: 0.06,
        }}
      />

      {/* Card */}
      <div
        className="glass-panel animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "2.5rem",
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" className="logo-badge" style={{ justifyContent: "center", marginBottom: "1.25rem", display: "inline-flex", textDecoration: "none" }}>
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
            Welcome back
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--color-text-secondary)",
              marginTop: "0.375rem",
            }}
          >
            Sign in to your account to continue
          </p>
        </div>

        {/* Error Alert */}
        {serverError && (
          <div className="alert-error animate-fade-in" style={{ marginBottom: "1.25rem" }}>
            <span>⚠</span>
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="form-label">
              Email address
            </label>
            <input
              id="login-email"
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

          {/* Password */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="login-password" className="form-label" style={{ marginBottom: 0 }}>
                Password
              </label>
              <Link href="/forgot-password" style={{ fontSize: "0.825rem", color: "var(--color-primary-light)", textDecoration: "none", fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              style={{ marginTop: "0.5rem" }}
              autoComplete="current-password"
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="form-error">
                <span>✕</span> {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ marginTop: "0.5rem" }}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0", color: "var(--color-text-muted)" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }} />
          {/* <span style={{ padding: "0 0.75rem", fontSize: "0.875rem" }}>or continue with</span> */}
          <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }} />
        </div>

        {/* TEMPORARILY DISABLED FOR VERCEL MVP
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button onClick={() => signIn("google", { callbackUrl })} className="btn-secondary" style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={() => signIn("linkedin", { callbackUrl })} className="btn-secondary" style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              LinkedIn
            </button>
            <button onClick={() => signIn("facebook", { callbackUrl })} className="btn-secondary" style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>
        </div>
        */}

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            marginTop: "1.75rem",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
