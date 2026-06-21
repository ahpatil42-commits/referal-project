import { getPlatformStats, getRecentUsers } from "@/actions/admin";
import { getFeedbacks } from "@/actions/admin-feedback";
import { AdminClient } from "./admin-client";
import { AdminFeedbackAnalyzer } from "@/components/portal-admin/admin-feedback-analyzer";

export const metadata = { title: "Admin Portal | ReferralAI" };

export default async function AdminPage() {
  const [stats, users, feedbacks] = await Promise.all([
    getPlatformStats(),
    getRecentUsers(),
    getFeedbacks(),
  ]);

  return (
    <div>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
          Platform Overview
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Real-time metrics, financial performance, and user moderation.
        </p>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "1.5rem",
        marginBottom: "3rem" 
      }}>
        {/* Financial Metrics */}
        <StatCard title="MRR (Revenue)" value={`$${stats.mrr}`} icon="💰" color="#10b981" />
        <StatCard title="Pro Subscribers" value={stats.proUsers} icon="⚡" color="#8b5cf6" />
        
        {/* Platform Metrics */}
        <StatCard title="Total Users" value={stats.totalUsers} icon="👥" />
        <StatCard title="Seekers" value={stats.totalSeekers} icon="🎯" color="var(--color-accent)" />
        <StatCard title="Referrers" value={stats.totalReferrers} icon="💼" color="var(--color-primary-light)" />
        <StatCard title="Total Requests" value={stats.totalRequests} icon="📬" color="var(--color-warning)" />
        <StatCard title="Acceptance Rate" value={`${stats.acceptanceRate}%`} icon="📈" color="var(--color-success)" />
      </div>

      <div className="glass-panel" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "1.5rem" }}>
          Recent Users
        </h2>
        <AdminClient initialUsers={users} />
      </div>

      <AdminFeedbackAnalyzer initialFeedbacks={feedbacks} />
    </div>
  );
}

function StatCard({ title, value, icon, color = "var(--color-primary)" }: { title: string, value: string | number, icon: string, color?: string }) {
  return (
    <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
      <div style={{ 
        width: "48px", height: "48px", borderRadius: "12px", 
        background: `color-mix(in srgb, ${color} 15%, transparent)`, 
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.5rem"
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title}
        </p>
        <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1 }}>
          {value}
        </p>
      </div>
    </div>
  );
}
