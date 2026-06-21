"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const FeedbackSchema = z.object({
  type: z.enum(["BUG", "FEATURE_REQUEST", "GENERAL"]),
  message: z.string().min(5, "Feedback message must be at least 5 characters").max(1000, "Feedback is too long"),
});

export async function submitFeedback(data: { type: "BUG" | "FEATURE_REQUEST" | "GENERAL"; message: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to submit feedback." };
  }

  try {
    const parsed = FeedbackSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message || "Invalid feedback data." };
    }

    await db.feedback.create({
      data: {
        userId: session.user.id,
        type: parsed.data.type,
        message: parsed.data.message,
      },
    });

    return { success: "Thank you! Your feedback has been submitted successfully." };
  } catch (error) {
    console.error("[FEEDBACK_ERROR]", error);
    return { error: "Failed to submit feedback. Please try again later." };
  }
}
