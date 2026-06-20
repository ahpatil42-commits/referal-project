import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ReferrerRequestsClient } from "@/components/dashboard/referrer-requests-client";
import { EmptyState } from "@/components/ui/empty-state";
import { calculateMatchScore } from "@/actions/matching";

export const metadata = { title: "Referral Requests | ReferralAI" };

export default async function ReferrerRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const referrerProfile = await db.referrerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      receivedRequests: {
        orderBy: { createdAt: "desc" },
        include: {
          seeker: {
            include: { user: { select: { email: true, name: true } } },
          },
          messages: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  const requests = referrerProfile?.receivedRequests ?? [];

  const requestsWithScores = await Promise.all(
    requests.map(async (req) => {
      const matchScore = await calculateMatchScore(req.seeker as any, referrerProfile as any);
      return { ...req, matchScore };
    })
  );

  return (
    <div style={{ maxWidth: "1100px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
          Referral Requests 📥
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
          {requests.length} total request{requests.length !== 1 ? "s" : ""} · {requests.filter((r) => r.status === "PENDING").length} pending
        </p>
      </div>

      {requests.length === 0 && (
        <EmptyState
          icon="📭"
          title="No requests yet"
          description="Complete your profile so seekers can find and contact you."
          actionHref="/dashboard/referrer/profile"
          actionLabel="Update Profile ↗"
        />
      )}

      {requests.length > 0 && (
        <ReferrerRequestsClient requests={requestsWithScores as any} currentUserId={session.user.id} />
      )}
    </div>
  );
}
