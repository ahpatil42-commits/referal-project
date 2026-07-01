import { NextResponse } from "next/server";
import { analyticsDb } from "@/lib/analytics-db";

export async function POST(req: Request) {
  // If the analytics DB isn't configured yet, silently ignore to not crash the app
  if (!analyticsDb) {
    return NextResponse.json({ success: false, reason: "Analytics DB not configured" });
  }

  try {
    const data = await req.json();
    const { session, pageVisits, interactions } = data;

    if (!session || !session.anonymousId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Upsert the session
    const dbSession = await analyticsDb.analyticSession.upsert({
      where: { anonymousId: session.anonymousId },
      update: {
        userId: session.userId || undefined,
        endedAt: session.endedAt ? new Date(session.endedAt) : undefined,
        totalTimeSpent: session.totalTimeSpent,
      },
      create: {
        anonymousId: session.anonymousId,
        userId: session.userId || undefined,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        country: session.country,
        startedAt: session.startedAt ? new Date(session.startedAt) : new Date(),
      },
    });

    // Insert page visits
    if (pageVisits && pageVisits.length > 0) {
      await analyticsDb.pageVisit.createMany({
        data: pageVisits.map((pv: any) => ({
          sessionId: dbSession.id,
          path: pv.path,
          referrer: pv.referrer,
          timestamp: pv.timestamp ? new Date(pv.timestamp) : new Date(),
          timeSpent: pv.timeSpent,
        })),
        skipDuplicates: true,
      });
    }

    // Insert interactions
    if (interactions && interactions.length > 0) {
      await analyticsDb.interaction.createMany({
        data: interactions.map((interaction: any) => ({
          sessionId: dbSession.id,
          eventType: interaction.eventType,
          elementId: interaction.elementId,
          metadata: interaction.metadata ? JSON.stringify(interaction.metadata) : null,
          timestamp: interaction.timestamp ? new Date(interaction.timestamp) : new Date(),
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    import('@/lib/logger').then(({ logger }) => {
      logger.error({ msg: '[ANALYTICS_INGEST_ERROR]', error });
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
