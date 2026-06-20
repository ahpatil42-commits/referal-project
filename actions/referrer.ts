"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendEmailNotification } from "@/lib/email";
import { z } from "zod";

// ── Profile ──────────────────────────────────────────────────────────────────

const ReferrerProfileSchema = z.object({
  company:        z.string().max(100).optional(),
  jobTitle:       z.string().max(100).optional(),
  yearsAtCompany: z.coerce.number().int().min(0).max(50).optional(),
  bio:            z.string().max(800).optional(),
  corporateEmail: z.string().email().optional().or(z.literal("")),
  linkedinUrl:    z.string().url().optional().or(z.literal("")),
  maxReferrals:   z.coerce.number().int().min(1).max(20).optional(),
});

export type ReferrerProfileValues = z.infer<typeof ReferrerProfileSchema>;

export async function updateReferrerProfile(
  values: ReferrerProfileValues
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  if (session.user.role !== "REFERRER") return { error: "Unauthorized access." };

  const validated = ReferrerProfileSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid data." };

  const data = validated.data;

  try {
    await db.referrerProfile.upsert({
      where:  { userId: session.user.id },
      update: {
        company:        data.company        || null,
        jobTitle:       data.jobTitle       || null,
        yearsAtCompany: data.yearsAtCompany ?? null,
        bio:            data.bio            || null,
        corporateEmail: data.corporateEmail || null,
        linkedinUrl:    data.linkedinUrl    || null,
        maxReferrals:   data.maxReferrals   ?? 3,
      },
      create: {
        userId:         session.user.id,
        company:        data.company        || null,
        jobTitle:       data.jobTitle       || null,
        yearsAtCompany: data.yearsAtCompany ?? null,
        bio:            data.bio            || null,
        corporateEmail: data.corporateEmail || null,
        linkedinUrl:    data.linkedinUrl    || null,
        maxReferrals:   data.maxReferrals   ?? 3,
      },
    });

    revalidatePath("/dashboard/referrer/profile");
    revalidatePath("/dashboard/referrer");
    revalidatePath("/dashboard/seeker/browse");
    return { success: "Profile updated!" };
  } catch (err) {
    console.error("[UPDATE_REFERRER_PROFILE]", err);
    return { error: "Failed to save profile." };
  }
}

// ── Request Status ────────────────────────────────────────────────────────────

const UpdateStatusSchema = z.object({
  requestId:    z.string().min(1),
  status:       z.enum(["ACCEPTED", "REJECTED", "COMPLETED", "IGNORED"]),
  referrerNote: z.string().max(500).optional(),
});

export async function updateRequestStatus(
  values: z.infer<typeof UpdateStatusSchema>
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  if (session.user.role !== "REFERRER") return { error: "Only referrers can update request status." };

  const validated = UpdateStatusSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid data." };

  const { requestId, status, referrerNote } = validated.data;

  // Verify the request belongs to this referrer
  const referrerProfile = await db.referrerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!referrerProfile) return { error: "Referrer profile not found." };

  const request = await db.referralRequest.findFirst({
    where: { id: requestId, referrerId: referrerProfile.id },
  });
  if (!request) return { error: "Request not found." };

  try {
    const updated = await db.referralRequest.update({
      where: { id: requestId },
      data:  { status, referrerNote: referrerNote ?? null },
      include: {
        seeker: { include: { user: { select: { email: true, name: true } } } },
        referrer: { include: { user: { select: { name: true } } } },
      }
    });

    if (status === "ACCEPTED" && updated.seeker.user.email) {
      const refName = updated.referrer.user.name || "A Referrer";
      await sendEmailNotification(
        updated.seeker.user.email,
        `Your referral request was accepted by ${refName}!`,
        `Good news!\n\n${refName} has accepted your referral request for the ${updated.jobTitle} position at ${updated.company}.\n\nYou can now message them directly in your dashboard.\n\nLog in to ReferralAI to chat: http://localhost:3000/dashboard/seeker/requests`
      );
    }

    if (status === "ACCEPTED" || status === "REJECTED") {
      await db.notification.create({
        data: {
          userId: updated.seeker.userId,
          title: `Request ${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}`,
          message: `Your request for ${updated.jobTitle} at ${updated.company} was ${status.toLowerCase()}.`,
          link: "/dashboard/seeker/requests"
        }
      });
    }

    revalidatePath("/dashboard/referrer/requests");
    revalidatePath("/dashboard/referrer/referrals");
    revalidatePath("/dashboard/seeker/requests");
    return { success: `Request ${status.toLowerCase()}.` };
  } catch (err) {
    console.error("[UPDATE_REQUEST_STATUS]", err);
    return { error: "Failed to update request." };
  }
}
