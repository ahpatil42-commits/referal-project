"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import * as z from "zod";

const reportSchema = z.object({
  reportedId: z.string().min(1),
  reason: z.enum(["SPAM", "HARASSMENT", "INAPPROPRIATE", "FAKE_PROFILE", "OTHER"]),
  details: z.string().optional()
});

export async function submitReport(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const data = {
      reportedId: formData.get("reportedId") as string,
      reason: formData.get("reason") as any,
      details: formData.get("details") as string | undefined,
    };

    const validated = reportSchema.parse(data);

    await db.report.create({
      data: {
        reporterId: session.user.id,
        reportedId: validated.reportedId,
        reason: validated.reason,
        details: validated.details,
      }
    });

    return { success: "Report submitted successfully. Our team will review it." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid report data provided." };
    }
    return { error: "Failed to submit report." };
  }
}
