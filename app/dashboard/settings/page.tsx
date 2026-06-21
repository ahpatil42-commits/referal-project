import { GDPRActions } from "@/components/dashboard/gdpr-actions";

export const metadata = {
  title: "Settings | ReferralAI",
  description: "Manage your account settings",
};

export default function SettingsPage() {
  return (
    <div className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
            Account Settings ⚙️
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
            Manage your account data and preferences.
          </p>
        </div>
      </div>

      <GDPRActions />
    </div>
  );
}
