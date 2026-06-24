"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PostingSchema = z.object({
  jobTitle:     z.string().min(2, "Job title required").max(100),
  company:      z.string().min(2, "Company required").max(100),
  jobUrl:       z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description:  z.string().max(2000).optional(),
  experience:   z.string().max(200).optional(),
  skills:       z.string().max(500).optional(),
  location:     z.string().max(200).optional(),
  noticePeriod: z.string().max(100).optional(),
});

export async function createReferralPosting(data: z.infer<typeof PostingSchema>) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };
    if (session.user.role !== "REFERRER") return { error: "Only referrers can create postings." };

    const validated = PostingSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.errors[0]?.message ?? "Invalid posting data." };
    }

    const { jobTitle, company, jobUrl, description, experience, skills, location, noticePeriod } = validated.data;

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
        jobTitle,
        company,
        jobUrl:      jobUrl      || null,
        description: description || null,
        experience:  experience  || null,
        skills:      skills      || null,
        location:    location    || null,
        noticePeriod: noticePeriod || null,
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

export async function deactivatePosting(postingId: string) {
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
      data: { isActive: false },
    });

    revalidatePath("/dashboard/referrer/profile");
    revalidatePath("/dashboard/seeker/browse");
    return { success: "Posting deleted" };
  } catch (error) {
    console.error("Delete posting error:", error);
    return { error: "Failed to delete posting" };
  }
}
