import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Force Next.js to not cache this route so the cron always runs fresh
export const dynamic = 'force-dynamic';

const TARGET_COMPANIES = [
  { name: "Vercel", boardToken: "vercel" },
  { name: "Figma", boardToken: "figma" },
  { name: "Stripe", boardToken: "stripe" },
  { name: "OpenAI", boardToken: "openai" },
];

export async function GET(req: Request) {
  // Simple cron authentication (Vercel Cron sends a Bearer token or specific header)
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let newJobsCount = 0;

    for (const company of TARGET_COMPANIES) {
      // Greenhouse public API for jobs
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${company.boardToken}/jobs`);
      if (!res.ok) {
        import('@/lib/logger').then(({ logger }) => {
          logger.warn({ msg: 'Failed to fetch jobs', company: company.name, status: res.status });
        });
        continue;
      }

      const data = await res.json();
      const jobs = data.jobs || [];

      for (const job of jobs) {
        // Upsert the job into our JobPosting cache
        // Note: Greenhouse job IDs are unique per board, but we'll just check by URL to be safe across companies
        const exists = await db.jobPosting.findFirst({
          where: { url: job.absolute_url }
        });

        if (!exists) {
          await db.jobPosting.create({
            data: {
              companyName: company.name,
              title: job.title,
              description: "Full description available on job site.", // To save DB space, we only store a placeholder, or we could fetch the specific job details via /jobs/{id}
              url: job.absolute_url,
              location: job.location?.name || "Remote",
              isActive: true,
            }
          });
          newJobsCount++;
        }
      }
    }

    return NextResponse.json({ success: true, message: `Synced ${newJobsCount} new jobs.` });
  } catch (error: any) {
    import('@/lib/logger').then(({ logger }) => {
      logger.error({ msg: '[CRON_SYNC_JOBS_ERROR]', error });
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
