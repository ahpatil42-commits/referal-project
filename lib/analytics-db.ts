import { PrismaClient as AnalyticsPrismaClient } from "@prisma/analytics-client";

declare global {
  // eslint-disable-next-line no-var
  var analyticsPrisma: AnalyticsPrismaClient | undefined;
}

// Safely instantiate the secondary Prisma client only if the URL is provided 
export const analyticsDb =
  globalThis.analyticsPrisma ||
  (process.env.ANALYTICS_DATABASE_URL
    ? new AnalyticsPrismaClient()
    : null);

if (process.env.NODE_ENV !== "production" && analyticsDb) {
  globalThis.analyticsPrisma = analyticsDb;
}
