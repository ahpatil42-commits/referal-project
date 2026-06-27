import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "./SignOutButton";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function PendingVerificationPage() {
  // Read the Supabase session token from cookies (server-side)
  const cookieStore = await cookies();
  const token = cookieStore.getAll()
    .find((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"))?.value;

  if (!token) {
    redirect("/login");
  }

  const supabase = createAdminClient();
  let userEmail: string | null = null;

  try {
    const parsed = JSON.parse(token);
    const accessToken = Array.isArray(parsed) ? parsed[0] : parsed?.access_token;
    if (accessToken) {
      const { data } = await supabase.auth.getUser(accessToken);
      if (!data?.user) redirect("/login");

      // Already verified — send to dashboard
      if (data.user.email_confirmed_at) redirect("/dashboard");

      userEmail = data.user.email ?? null;
    } else {
      redirect("/login");
    }
  } catch {
    redirect("/login");
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
            and try again.
          </p>
        </div>

        <SignOutButton />
      </div>
    </div>
  );
}
