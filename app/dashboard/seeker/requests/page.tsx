import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ChatButton } from "@/components/dashboard/chat-button";
import { ReviewButton } from "@/components/dashboard/review-button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "My Requests | ReferralAI" };

export default async function SeekerRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const seekerProfile = await db.seekerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      sentRequests: {
        orderBy: { createdAt: "desc" },
        include: {
          referrer: { include: { user: { select: { email: true, name: true } } } },
          messages: { orderBy: { createdAt: "asc" } }
        },
      },
      givenReviews: {
        select: { referrerId: true }
      }
    },
  });

  const requests = seekerProfile?.sentRequests ?? [];
  const reviewedReferrerIds = new Set(seekerProfile?.givenReviews?.map(r => r.referrerId) || []);

  return (
    <div style={{ maxWidth: "1100px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
          My Requests 📬
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
          {requests.length} referral request{requests.length !== 1 ? "s" : ""} sent
        </p>
      </div>

      {requests.length === 0 && (
        <EmptyState
          icon="📭"
          title="No requests yet"
          description="Head to Browse Referrers to find matches and send your first referral request!"
          actionHref="/dashboard/seeker/browse"
          actionLabel="Browse Referrers ↗"
        />
      )}

      {requests.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {requests.map((req) => {
            const refName =
              req.referrer.user.name || req.referrer.user.email.split("@")[0];
            return (
              <div key={req.id} className="glass-panel" style={{ padding: "1.25rem 1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                    flexWrap: "wrap",
                    marginBottom: req.referrerNote ? "0.875rem" : 0,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                        {req.jobTitle}
                      </h3>
                      <span style={{ color: "var(--color-text-muted)" }}>@</span>
                      <span style={{ fontWeight: 600, color: "var(--color-primary-light)" }}>
                        {req.company}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.825rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
                      Referrer: <strong style={{ color: "var(--color-text-secondary)" }}>{refName}</strong>
                      {req.referrer.company && ` · ${req.referrer.company}`}
                      {" · "}
                      {new Date(req.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </p>
                    {req.jobUrl && (
                      <a
                        href={req.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--color-primary-light)",
                          marginTop: "0.25rem",
                          display: "inline-block",
                        }}
                      >
                        View Job Posting ↗
                      </a>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <StatusBadge status={req.status} />
                    {req.status === "ACCEPTED" && (
                      <ChatButton
                        requestId={req.id}
                        currentUserId={session.user.id}
                        messages={req.messages}
                        otherUserName={refName}
                      />
                    )}
                    {req.status === "COMPLETED" && (
                      <ReviewButton
                        referrerId={req.referrerId}
                        referrerName={refName}
                        hasReviewed={reviewedReferrerIds.has(req.referrerId)}
                      />
                    )}
                  </div>
                </div>

                {req.referrerNote && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.75rem 1rem",
                      fontSize: "0.85rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "var(--color-text-muted)", fontSize: "0.75rem", display: "block", marginBottom: "0.3rem" }}>
                      REFERRER NOTE
                    </span>
                    {req.referrerNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
