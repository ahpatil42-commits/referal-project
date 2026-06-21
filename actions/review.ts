"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import * as z from "zod";

const reviewSchema = z.object({
  referrerId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function submitReview(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const data = {
      referrerId: formData.get("referrerId") as string,
      rating: parseInt(formData.get("rating") as string, 10),
      comment: formData.get("comment") as string | undefined,
    };

    const validated = reviewSchema.parse(data);

    // Verify they have a completed referral with this referrer
    const seekerProfile = await db.seekerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!seekerProfile) return { error: "No seeker profile found" };

    const hasCompletedRequest = await db.referralRequest.findFirst({
      where: {
        seekerId: seekerProfile.id,
        referrerId: validated.referrerId,
        status: "COMPLETED",
      }
    });

    if (!hasCompletedRequest) {
      return { error: "You can only review referrers after a completed referral request." };
    }

    await db.review.create({
      data: {
        seekerId: seekerProfile.id,
        referrerId: validated.referrerId,
        rating: validated.rating,
        comment: validated.comment,
      }
    });

    return { success: "Review submitted successfully! Thank you for your feedback." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid review data provided." };
    }
    // Handle unique constraint if they already reviewed
    if ((error as any).code === "P2002") {
      return { error: "You have already reviewed this referrer." };
    }
    return { error: "Failed to submit review." };
  }
}
