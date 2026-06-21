import { db } from "@/lib/db";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companies with Referrals | ReferralAI",
  description: "Browse the top tech companies and find referrers to get your resume in front of hiring managers.",
};

export default async function CompaniesDirectoryPage() {
  // Fetch distinct companies that have active referrers
  // Since Prisma doesn't easily support distinct with relation filtering in a single query for SQLite/Postgres elegantly without raw SQL,
  // we will fetch referrers and group them by company in memory. Since this is an MVP, this is fine for now.
  const referrers = await db.referrerProfile.findMany({
    select: { company: true },
    where: { company: { not: null } }
  });

  const companyCounts: Record<string, number> = {};
  referrers.forEach(r => {
    if (r.company) {
      const lower = r.company.toLowerCase();
      companyCounts[lower] = (companyCounts[lower] || 0) + 1;
    }
  });

  // Sort by count descending
  const sortedCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([company, count]) => ({
      name: company.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      slug: company.toLowerCase().replace(/\s+/g, "-"),
      count
    }));

  return (
    <main className="bg-space" style={{ minHeight: "100vh", padding: "8rem 2rem 6rem", position: "relative" }}>
      <div className="z-content animate-fade-in-up" style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.5rem" }}>
          Browse <span className="text-gradient-purple">Companies</span>
        </h1>
        <p style={{ fontSize: "1.25rem", color: "var(--color-text-secondary)", maxWidth: "700px", margin: "0 auto 4rem", lineHeight: 1.6 }}>
          Find employees at your dream company and request a referral today.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem", textAlign: "left" }}>
          {sortedCompanies.map((c) => (
            <Link key={c.slug} href={`/companies/${c.slug}`} style={{ textDecoration: "none" }}>
              <div className="glass-panel dashboard-card" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{c.name}</span>
                <span style={{ background: "rgba(167, 139, 250, 0.15)", color: "var(--color-purple)", padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 600 }}>
                  {c.count} Referrer{c.count !== 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
          {sortedCompanies.length === 0 && (
             <div style={{ gridColumn: "1 / -1", color: "var(--color-text-muted)", padding: "3rem" }}>
               No companies found. Sign up and be the first!
             </div>
          )}
        </div>
      </div>
    </main>
  );
}
