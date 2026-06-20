import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

import { db } from "@/lib/db";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true }
  });

  if (!user || !user.isAdmin) {
    // Hidden from non-admins
    notFound();
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background-darker)", padding: "2rem" }}>
      <header style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className="logo-badge" style={{ transform: "scale(0.8)", transformOrigin: "left center" }}>
            <div className="logo-icon">✦</div>
            <span>ReferralAI</span>
          </div>
          <span style={{ color: "var(--color-primary-light)", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.05em" }}>
            ADMIN PORTAL
          </span>
        </div>
        <nav style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/admin" style={{ color: "var(--color-text-primary)", fontWeight: 600, textDecoration: "none" }}>Overview</Link>
          <Link href="/dashboard/seeker" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.9rem" }}>Back to App ↗</Link>
        </nav>
      </header>
      
      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
