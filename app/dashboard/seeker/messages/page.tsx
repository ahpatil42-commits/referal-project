import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChatButton } from "@/components/dashboard/chat-button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";

export const metadata = { title: "Messages | ReferralAI" };

export default async function SeekerMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const seekerProfile = await db.seekerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      sentRequests: {
        where: { status: { in: ["ACCEPTED", "COMPLETED"] } },
        orderBy: { updatedAt: "desc" },
        include: {
          referrer: {
            include: { user: { select: { email: true, name: true } } },
          },
          messages: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  const conversations = JSON.parse(
    JSON.stringify(seekerProfile?.sentRequests ?? [])
  );

  conversations.sort((a: any, b: any) => {
    const aLast = a.messages?.[a.messages.length - 1]?.createdAt ?? a.updatedAt;
    const bLast = b.messages?.[b.messages.length - 1]?.createdAt ?? b.updatedAt;
    return new Date(bLast).getTime() - new Date(aLast).getTime();
  });

  return (
    <div style={{ maxWidth: "1100px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
          Messages
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
          Receive and continue conversations with referrers who accepted your requests.
        </p>
      </div>

      {conversations.length === 0 && (
        <EmptyState
          icon="MSG"
          title="No messages yet"
          description="When a referrer accepts your request, the conversation will appear here."
          actionHref="/dashboard/seeker/requests"
          actionLabel="View My Requests"
        />
      )}

      {conversations.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {conversations.map((req: any) => {
            const referrerName =
              req.referrer.user.name || req.referrer.user.email.split("@")[0];
            const latestMessage = req.messages?.[req.messages.length - 1];
            const latestDate = latestMessage?.createdAt ?? req.updatedAt;
            const latestText = latestMessage
              ? latestMessage.content
              : "No messages yet. Start the conversation.";

            return (
              <div key={req.id} className="glass-panel" style={{ padding: "1.25rem 1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 0, flex: "1 1 280px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
                      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                        {referrerName}
                      </h2>
                      <StatusBadge status={req.status} />
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
                      {req.jobTitle} @ {req.company}
                      {req.referrer.company && req.referrer.company !== req.company ? ` - ${req.referrer.company}` : ""}
                    </p>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: latestMessage ? "var(--color-text-secondary)" : "var(--color-text-muted)",
                        marginTop: "0.85rem",
                        lineHeight: 1.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {latestText}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.55rem" }}>
                      {latestMessage ? "Last message" : "Accepted"} {new Date(latestDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <ChatButton
                      requestId={req.id}
                      currentUserId={session.user.id}
                      messages={req.messages ?? []}
                      otherUserName={referrerName}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}