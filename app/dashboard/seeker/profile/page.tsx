import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SeekerProfileForm } from "@/components/dashboard/seeker-profile-form";

export const metadata = { title: "My Profile | ReferralAI" };

export default async function SeekerProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { seekerProfile: true }
  });
  const profile = user?.seekerProfile;

  return (
    <div style={{ maxWidth: "1100px", width: "100%" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
          My Profile 👤
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
          A complete profile significantly increases your chances of getting referred.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: "2rem", width: "100%", maxWidth: "960px" }}>
        <SeekerProfileForm
          initialData={{
            headline:    profile?.headline    ?? "",
            bio:         profile?.bio         ?? "",
            skills:      profile?.skills      ?? "",
            resumeUrl:   profile?.resumeUrl   ?? "",
            linkedinUrl: profile?.linkedinUrl ?? "",
            githubUrl:   profile?.githubUrl   ?? "",
            targetRoles: profile?.targetRoles ?? "",
            image:       user?.image          ?? null,
            profileNumber: user?.profileNumber ?? null,
          }}
        />
      </div>
    </div>
  );
}
