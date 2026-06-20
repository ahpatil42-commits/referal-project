import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { NotificationFeed } from "@/components/dashboard/notification-feed";
import Link from "next/link";

export const metadata = { title: "Referrer Dashboard" };

export default async function ReferrerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const referrerProfile = await db.referrerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      receivedRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { seeker: { include: { user: { select: { email: true, name: true } } } } },
      },
    },
  });

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const total    = referrerProfile?.receivedRequests.length ?? 0;
  const pending  = referrerProfile?.receivedRequests.filter((r) => r.status === "PENDING").length  ?? 0;
  const accepted = referrerProfile?.receivedRequests.filter((r) => r.status === "ACCEPTED").length ?? 0;

  const isProfileComplete = !!(referrerProfile?.company && referrerProfile?.jobTitle);

  return (
    <div style={{ maxWidth: "1100px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
          Welcome back 👋
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
          {session.user.email}
        </p>
      </div>

      {/* Profile completion banner */}
      {!isProfileComplete && (
        <div
          className="glass-panel"
          style={{
            padding: "1rem 1.5rem",
            marginBottom: "1.75rem",
            borderColor: "rgba(167,139,250,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.5rem" }}>✍️</span>
            <div>
              <p style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "0.95rem" }}>
                Complete your profile
              </p>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.825rem" }}>
                Seekers can only send you requests after you add your company and job title.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/referrer/profile"
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "var(--radius-md)",
              background: "var(--color-purple)",
              color: "white",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Set up profile →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard label="Requests Received" value={total}    emoji="📥" accentColor="var(--color-purple)" />
        <StatCard label="Awaiting Review"   value={pending}  emoji="🕐" accentColor="var(--color-warning)" />
        <StatCard label="Accepted"          value={accepted} emoji="✅" accentColor="var(--color-success)" />
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { href: "/dashboard/referrer/requests",  emoji: "📥", label: "Review Requests",  desc: "Accept or reject incoming requests" },
          { href: "/dashboard/referrer/referrals", emoji: "✅", label: "My Referrals",      desc: "View candidates you've accepted" },
          { href: "/dashboard/referrer/profile",   emoji: "👤", label: "Edit Profile",      desc: "Update your company and referral info" },
        ].map((card) => (
          <Link key={card.href} href={card.href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
            <div className="glass-panel dashboard-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.625rem" }}>{card.emoji}</div>
              <h3 style={{ fontSize: "0.975rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.3rem" }}>
                {card.label}
              </h3>
              <p style={{ fontSize: "0.825rem", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                {card.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Notifications Feed */}
      {notifications.length > 0 && (
        <NotificationFeed initialNotifications={notifications} />
      )}

      {/* Recent requests */}
      {(referrerProfile?.receivedRequests.length ?? 0) > 0 && (
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "1rem" }}>
            Recent Requests
          </h2>
          <div className="glass-panel" style={{ overflow: "hidden" }}>
            {referrerProfile!.receivedRequests.map((req, i) => {
              const seekerName = req.seeker.user.name || req.seeker.user.email.split("@")[0];
              return (
                <div
                  key={req.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.875rem 1.25rem",
                    borderBottom: i < referrerProfile!.receivedRequests.length - 1 ? "1px solid var(--glass-border)" : "none",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "0.9rem" }}>
                      {seekerName}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                      {req.jobTitle} @ {req.company} · {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <StatusBadge status={req.status} />
                    {req.status === "PENDING" && (
                      <Link
                        href="/dashboard/referrer/requests"
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--color-primary-light)",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                      >
                        Review →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
