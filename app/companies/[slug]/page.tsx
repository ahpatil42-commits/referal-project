import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatSlugToCompany(slug: string) {
  return slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const companyName = formatSlugToCompany(resolvedParams.slug);
  return {
    title: `Get a Referral at ${companyName} | ReferralAI`,
    description: `Connect with employees at ${companyName} and get a referral to land your dream job faster.`,
  };
}

export default async function CompanyLandingPage({ params }: PageProps) {
  const resolvedParams = await params;
  const companyName = formatSlugToCompany(resolvedParams.slug);

  // Fetch referrers at this company
  const referrers = await db.referrerProfile.findMany({
    where: {
      company: { equals: companyName, mode: "insensitive" }
    },
    include: {
      user: { select: { name: true, image: true } }
    },
    take: 6,
  });

  if (referrers.length === 0) {
    // We can still render a generic landing page even if 0 referrers currently exist,
    // to capture the SEO traffic and prompt users to check back or sign up as the first referrer.
  }

  return (
    <main className="bg-space" style={{ minHeight: "100vh", padding: "6rem 2rem", position: "relative", overflowX: "hidden" }}>
      {/* Background Glow */}
      <div 
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60vw",
          height: "60vh",
          background: "radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, rgba(0,0,0,0) 60%)",
          filter: "blur(80px)",
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      <div className="z-content animate-fade-in-up" style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "rgba(167, 139, 250, 0.1)", border: "1px solid rgba(167, 139, 250, 0.2)", color: "var(--color-purple)", padding: "0.5rem 1rem", borderRadius: "99px", fontSize: "0.875rem", fontWeight: 600, marginBottom: "2rem" }}>
          Company Spotlight
        </div>
        
        <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.5rem" }}>
          Get a Job Referral at <span className="text-gradient-purple">{companyName}</span>
        </h1>
        
        <p style={{ fontSize: "1.25rem", color: "var(--color-text-secondary)", maxWidth: "700px", margin: "0 auto 3rem", lineHeight: 1.6 }}>
          Skip the resume black hole. Connect directly with {referrers.length > 0 ? referrers.length : "verified"} employees at {companyName} and get your resume directly in front of the hiring manager.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "5rem" }}>
          <Link href="/register?role=SEEKER" className="btn-primary" style={{ textDecoration: "none", width: "auto", padding: "1rem 2rem" }}>
            Request a Referral
          </Link>
          <Link href="/register?role=REFERRER" className="btn-secondary-hover" style={{ textDecoration: "none", width: "auto", padding: "1rem 2rem", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", color: "var(--color-text-primary)", fontWeight: 600 }}>
            I work at {companyName}
          </Link>
        </div>

        {/* Referrers Grid */}
        <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2rem", color: "var(--color-text-primary)" }}>
          Active Referrers at {companyName}
        </h2>
        
        {referrers.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem", textAlign: "left" }}>
            {referrers.map((referrer) => (
              <div key={referrer.id} className="glass-panel dashboard-card">
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--color-bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--glass-border)", color: "var(--color-primary-light)", fontWeight: 700, fontSize: "1.2rem" }}>
                    {referrer.user.name?.[0] || "?"}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{referrer.user.name || "Anonymous User"}</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-primary-light)", fontWeight: 500 }}>{referrer.jobTitle}</p>
                  </div>
                </div>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "1.5rem" }}>
                  {referrer.bio || `I'm a ${referrer.jobTitle} at ${referrer.company}. Reach out if you think you'd be a good fit!`}
                </p>
                <Link href="/register?role=SEEKER" className="btn-primary" style={{ display: "block", textAlign: "center", textDecoration: "none", fontSize: "0.9rem", padding: "0.75rem" }}>
                  Request Referral
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: "4rem 2rem", background: "rgba(255,255,255,0.02)" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Be the first!</h3>
            <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>We don't have any public referrers from {companyName} right now. Sign up and start earning a reputation!</p>
            <Link href="/register?role=REFERRER" className="btn-primary" style={{ textDecoration: "none", width: "auto", display: "inline-block" }}>
              Become a Referrer
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
