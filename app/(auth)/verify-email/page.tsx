import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex-center z-content" style={{ minHeight: "100vh", padding: "2rem" }}>
        <div className="glass-panel text-center" style={{ padding: "3rem", maxWidth: "400px" }}>
          <h1 style={{ fontSize: "1.5rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>Invalid Link</h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>This verification link is missing a token.</p>
          <Link href="/login" className="btn-primary" style={{ textDecoration: "none" }}>Back to Login</Link>
        </div>
      </div>
    );
  }

  const existingToken = await db.verificationToken.findUnique({
    where: { token }
  });

  if (!existingToken) {
    return (
      <div className="flex-center z-content" style={{ minHeight: "100vh", padding: "2rem" }}>
        <div className="glass-panel text-center" style={{ padding: "3rem", maxWidth: "400px" }}>
          <h1 style={{ fontSize: "1.5rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>Invalid Token</h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>This verification token does not exist or has already been used.</p>
          <Link href="/login" className="btn-primary" style={{ textDecoration: "none" }}>Back to Login</Link>
        </div>
      </div>
    );
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return (
      <div className="flex-center z-content" style={{ minHeight: "100vh", padding: "2rem" }}>
        <div className="glass-panel text-center" style={{ padding: "3rem", maxWidth: "400px" }}>
          <h1 style={{ fontSize: "1.5rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>Token Expired</h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>This verification link has expired. Please register again or request a new link.</p>
          <Link href="/register" className="btn-primary" style={{ textDecoration: "none" }}>Register</Link>
        </div>
      </div>
    );
  }

  // Verify the user
  const user = await db.user.findUnique({
    where: { email: existingToken.identifier }
  });

  if (!user) {
    return (
      <div className="flex-center z-content" style={{ minHeight: "100vh", padding: "2rem" }}>
        <div className="glass-panel text-center" style={{ padding: "3rem", maxWidth: "400px" }}>
          <h1 style={{ fontSize: "1.5rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>User Not Found</h1>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>The user associated with this token does not exist.</p>
          <Link href="/register" className="btn-primary" style={{ textDecoration: "none" }}>Register</Link>
        </div>
      </div>
    );
  }

  // Update user and delete token
  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.identifier, // Set to existing just in case
    }
  });

  await db.verificationToken.delete({
    where: { token: existingToken.token }
  });

  return (
    <div className="flex-center z-content" style={{ minHeight: "100vh", padding: "2rem" }}>
      <div className="glass-panel text-center animate-fade-in-up" style={{ padding: "3rem", maxWidth: "400px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
        <h1 style={{ fontSize: "1.5rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>Email Verified!</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>Your email has been successfully verified. You can now access your dashboard.</p>
        <Link href="/login" className="btn-primary" style={{ textDecoration: "none" }}>Continue to Login</Link>
      </div>
    </div>
  );
}
