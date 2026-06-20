import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
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
          Manage Roles 📋
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
          Add specific roles you are willing to refer candidates for.
        </p>
      </div>

      <ReferrerPostingsList 
        postings={profile?.referralPostings || []} 
        defaultCompany={profile?.referralPostings?.[0]?.company || ""}
      />
    </div>
  );
}
