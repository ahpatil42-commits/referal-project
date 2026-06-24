import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/dashboard/status-badge";

export const metadata = { title: "My Referrals | ReferralAI" };

export default async function ReferrerReferralsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const referrerProfile = await db.referrerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      receivedRequests: {
        where: { status: "ACCEPTED" },
        orderBy: { updatedAt: "desc" },
        include: {
          seeker: {
            include: { user: { select: { email: true, name: true } } },
          },
        },
      },
    },
  });

  const referrals = referrerProfile?.receivedRequests ?? [];

  return (
    <div style={{ maxWidth: "1100px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
          My Referrals ✅
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
          {referrals.length} candidate{referrals.length !== 1 ? "s" : ""} you&apos;ve agreed to refer
        </p>
      </div>

      {referrals.length === 0 && (
        <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌱</div>
          <h3 style={{ color: "var(--color-text-primary)", fontWeight: 600, marginBottom: "0.5rem" }}>
            No referrals yet
          </h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            Accept incoming requests to start building your referral history.
          </p>
        </div>
      )}

      {referrals.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {referrals.map((ref) => {
            const seekerName = ref.seeker.user.name || ref.seeker.user.email.split("@")[0];
            const skills = (Array.isArray(ref.seeker.skills) ? ref.seeker.skills : []) as string[];
            return (
              <div key={ref.id} className="glass-panel" style={{ padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                    <div
                      style={{
                        width: "44px", height: "44px", borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--color-success), var(--color-accent))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem", fontWeight: 700, color: "white", flexShrink: 0,
                      }}
                    >
                      {seekerName[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "var(--color-text-primary)", fontSize: "0.95rem" }}>{seekerName}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{ref.seeker.user.email}</p>
                    </div>
                  </div>
                  <StatusBadge status={ref.status} />
                </div>

                <div style={{ marginBottom: "0.75rem" }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                    {ref.jobTitle} <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>@</span> {ref.company}
                  </p>
                  {ref.jobUrl && (
                    <a href={ref.jobUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: "0.8rem", color: "var(--color-primary-light)", marginTop: "0.2rem", display: "inline-block" }}>
                      View Job Posting ↗
                    </a>
                  )}
                </div>

                {skills.length > 0 && (
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                    {skills.slice(0, 5).map((s) => (
                      <span key={s} style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem", borderRadius: "9999px", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.15)", color: "var(--color-accent)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  {ref.seeker.linkedinUrl && (
                    <a href={ref.seeker.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textDecoration: "none" }}>
                      🔗 LinkedIn
                    </a>
                  )}
                  <span style={{ fontSize: "0.775rem", color: "var(--color-text-muted)" }}>
                    Accepted {new Date(ref.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
