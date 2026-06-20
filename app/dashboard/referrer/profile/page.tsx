import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ReferrerProfileForm } from "@/components/dashboard/referrer-profile-form";
import { ReferrerPostingsList } from "@/components/dashboard/referrer-postings-list";

export const metadata = { title: "My Profile | ReferralAI" };

export default async function ReferrerProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { 
      referrerProfile: {
        include: { referralPostings: { orderBy: { createdAt: "desc" } } }
      } 
    }
  });
  const profile = user?.referrerProfile;

  return (
    <div style={{ maxWidth: "680px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
          My Profile 👤
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
          Complete your profile so seekers can find and request referrals from you.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: "2rem" }}>
        <ReferrerProfileForm
          initialData={{
            company:        profile?.company        ?? "",
            jobTitle:       profile?.jobTitle       ?? "",
            yearsAtCompany: profile?.yearsAtCompany ?? undefined,
            bio:            profile?.bio            ?? "",
            corporateEmail: profile?.corporateEmail ?? "",
            linkedinUrl:    profile?.linkedinUrl    ?? "",
            maxReferrals:   profile?.maxReferrals   ?? 3,
            image:          user?.image             ?? null,
          }}
        />
      </div>

      <ReferrerPostingsList 
        postings={profile?.referralPostings || []} 
        defaultCompany={profile?.company || ""}
      />
    </div>
  );
}
