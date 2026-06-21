"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createReferralPosting(data: { jobTitle: string; company: string; jobUrl?: string; description?: string; experience?: string; skills?: string; location?: string; noticePeriod?: string }) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    let referrer = await db.referrerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!referrer) {
      referrer = await db.referrerProfile.create({
        data: { userId: session.user.id },
      });
    }

    await db.referralPosting.create({
      data: {
        referrerId: referrer.id,
        jobTitle: data.jobTitle,
        company: data.company,
        jobUrl: data.jobUrl || null,
        description: data.description || null,
        experience: data.experience || null,
        skills: data.skills || null,
        location: data.location || null,
        noticePeriod: data.noticePeriod || null,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/referrer/profile");
    revalidatePath("/dashboard/seeker/browse");
    return { success: "Posting created successfully!" };
  } catch (error) {
    console.error("Create posting error:", error);
    return { error: "Failed to create posting" };
  }
}

export async function togglePostingStatus(postingId: string, isActive: boolean) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const referrer = await db.referrerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!referrer) return { error: "Referrer profile not found" };

    // Verify ownership
    const posting = await db.referralPosting.findUnique({
      where: { id: postingId },
    });

    if (!posting || posting.referrerId !== referrer.id) {
      return { error: "Posting not found or unauthorized" };
    }

    await db.referralPosting.update({
      where: { id: postingId },
      data: { isActive },
    });

    revalidatePath("/dashboard/referrer/profile");
    revalidatePath("/dashboard/seeker/browse");
    return { success: "Status updated" };
  } catch (error) {
    console.error("Toggle posting error:", error);
    return { error: "Failed to update posting" };
  }
}

export async function deletePosting(postingId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const referrer = await db.referrerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!referrer) return { error: "Referrer profile not found" };

    // Verify ownership
    const posting = await db.referralPosting.findUnique({
      where: { id: postingId },
    });

    if (!posting || posting.referrerId !== referrer.id) {
      return { error: "Posting not found or unauthorized" };
    }

    await db.referralPosting.delete({
      where: { id: postingId },
    });

    revalidatePath("/dashboard/referrer/profile");
    revalidatePath("/dashboard/seeker/browse");
    return { success: "Posting deleted" };
  } catch (error) {
    console.error("Delete posting error:", error);
    return { error: "Failed to delete posting" };
  }
}
