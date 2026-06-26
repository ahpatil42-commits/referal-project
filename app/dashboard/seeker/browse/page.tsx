import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ReferrerCard } from "@/components/dashboard/referrer-card";
import { BrowseFilters } from "./browse-filters";
import { calculateMatchScore } from "@/actions/matching";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Browse Referrers | ReferralAI" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BrowseReferrersPage(props: Props) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const minScoreParam = typeof searchParams.minScore === "string" ? parseInt(searchParams.minScore, 10) : 0;

  const session = await auth();
  if (!session?.user) redirect("/login");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const allReferrers = await db.referrerProfile.findMany({
    where: {
      company: { not: null },
      ...(q ? {
        OR: [
          { company: { contains: q } },
          { jobTitle: { contains: q } },
        ]
      } : {})
    },
    include: {
      user: { select: { email: true, name: true } },
      receivedRequests: {
        where: {
          status: "ACCEPTED",
          createdAt: { gte: startOfMonth },
        },
        select: { id: true }, // We only need the count
      },
      referralPostings: {
        where: { isActive: true },
        select: { id: true, jobTitle: true, jobUrl: true, company: true, description: true, experience: true, skills: true, location: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter out referrers who have reached their monthly quota
  const referrers = allReferrers.filter(ref => ref.receivedRequests.length < ref.maxReferrals);

  const seekerProfile = await db.seekerProfile.findUnique({
    where: { userId: session.user.id },
  });

  const referrersWithScores = (await Promise.all(
    referrers.map(async (ref) => {
      const score = await calculateMatchScore(seekerProfile, ref);
      return { ...ref, matchScore: score };
    })
  )).filter(ref => ref.matchScore >= minScoreParam);

  // Sort by match score descending
  referrersWithScores.sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
            Browse Referrers 🔍
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
            {referrers.length} professional{referrers.length !== 1 ? "s" : ""} available to refer you
          </p>
        </div>
        <BrowseFilters />
      </div>

      {/* Empty state */}
      {referrers.length === 0 && (
        <EmptyState
          icon={q ? "🔍" : "🤝"}
          title={q ? "No referrers found" : "No referrers yet"}
          description={q ? `We couldn't find any referrers matching "${q}". Try another search term.` : "Referrers who sign up and complete their profiles will appear here."}
          actionHref={q ? "/dashboard/seeker/browse" : undefined}
          actionLabel={q ? "Clear Search" : undefined}
        />
      )}

      {/* Grid */}
      {referrers.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {referrersWithScores.map((referrer) => (
            <ReferrerCard key={referrer.id} referrer={referrer} matchScore={referrer.matchScore} />
          ))}
        </div>
      )}
    </div>
  );
}
