import { GDPRActions } from "@/components/dashboard/gdpr-actions";
import { AccountVerificationSettings } from "@/components/dashboard/account-verification-settings";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ReferrerSettings } from "@/components/dashboard/referrer-settings";

export const metadata = {
  title: "Settings | ReferralAI",
  description: "Manage your account settings",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { 
      email: true, emailVerified: true, mobile: true, mobileVerified: true, role: true,
      referrerProfile: { select: { maxReferrals: true, atsProvider: true } } 
    }
  });

  if (!user) redirect("/login");

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

      <AccountVerificationSettings 
        email={user.email}
        emailVerified={!!session.user.emailVerified}
        mobile={user.mobile}
        mobileVerified={!!user.mobileVerified}
      />

      {user.role === "REFERRER" && user.referrerProfile && (
        <ReferrerSettings 
          maxReferrals={user.referrerProfile.maxReferrals} 
          atsProvider={user.referrerProfile.atsProvider} 
        />
      )}

      <GDPRActions />
    </div>
  );
}
