"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendEmailNotification } from "@/lib/mail";
import { z } from "zod";
import { pusherServer } from "@/lib/pusher";
import { getBaseUrl } from "@/lib/url";
import { actionRateLimiter } from "@/lib/rate-limit";
import { encrypt, decrypt } from "@/lib/encryption";

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

  const rateLimit = await actionRateLimiter.check(session.user.id);
  if (!rateLimit.success) return { error: "Too many requests. Please wait a minute." };

  const validated = ReferrerProfileSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid data." };

  const data = validated.data;

  try {
    const currentProfile = await db.referrerProfile.findUnique({
      where: { userId: session.user.id }
    });

    const isNewCorporateEmail = data.corporateEmail && data.corporateEmail !== currentProfile?.corporateEmail;

    const profile = await db.referrerProfile.upsert({
      where:  { userId: session.user.id },
      update: {
        company:        data.company        || null,
        jobTitle:       data.jobTitle       || null,
        yearsAtCompany: data.yearsAtCompany ?? null,
        bio:            data.bio            || null,
        corporateEmail: data.corporateEmail || null,
        linkedinUrl:    data.linkedinUrl    || null,
        maxReferrals:   data.maxReferrals   ?? 3,
        isVerified:     isNewCorporateEmail ? false : undefined, // Reset verification on change
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
        isVerified:     false,
      },
    });

    if (isNewCorporateEmail && data.corporateEmail) {
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      
      // Delete any existing tokens for this email
      await db.verificationToken.deleteMany({
        where: { identifier: data.corporateEmail }
      });

      await db.verificationToken.create({
        data: {
          identifier: data.corporateEmail,
          token,
          expires: new Date(Date.now() + 24 * 3600 * 1000) // 24 hours
        }
      });
      
      const { sendCorporateVerificationEmail } = await import("@/lib/mail");
      await sendCorporateVerificationEmail(data.corporateEmail, token);
    }

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

  const rateLimit = await actionRateLimiter.check(session.user.id);
  if (!rateLimit.success) return { error: "Too many requests. Please wait a minute." };

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
        `Good news!\n\n${refName} has accepted your referral request for the ${updated.jobTitle} position at ${updated.company}.\n\nYou can now message them directly in your dashboard.\n\nLog in to ReferralAI to chat: ${getBaseUrl()}/dashboard/seeker/requests`
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

      // Send Real-Time Pusher Notification (fail gracefully if not configured)
      try {
        await pusherServer.trigger(`user-${updated.seeker.userId}`, "new-notification", {
          title: `Request ${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}`,
          message: `Your request for ${updated.jobTitle} at ${updated.company} was ${status.toLowerCase()}.`,
          link: "/dashboard/seeker/requests"
        });
      } catch (pusherError) {
        console.warn("Pusher trigger failed:", pusherError);
      }
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

// ── ATS Integration (Phase 2) ─────────────────────────────────────────────────

const AtsConfigSchema = z.object({
  atsProvider: z.enum(["GREENHOUSE", "LEVER"]).optional(),
  atsApiKey:   z.string().max(512).optional().or(z.literal("")),
});

/**
 * Saves ATS credentials. The API key is encrypted at rest using AES-256-GCM
 * (lib/encryption.ts). Never store raw keys — always decrypt server-side before use.
 */
export async function updateAtsConfig(
  values: z.infer<typeof AtsConfigSchema>
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  if (session.user.role !== "REFERRER") return { error: "Unauthorized access." };

  const rateLimit = await actionRateLimiter.check(session.user.id);
  if (!rateLimit.success) return { error: "Too many requests. Please wait a minute." };

  const validated = AtsConfigSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid data." };

  const { atsProvider, atsApiKey } = validated.data;

  try {
    await db.referrerProfile.upsert({
      where:  { userId: session.user.id },
      update: {
        atsProvider: atsProvider || null,
        // Encrypt the key before storing. Empty string clears it.
        atsApiKey:   atsApiKey ? encrypt(atsApiKey) : null,
      },
      create: {
        userId:      session.user.id,
        atsProvider: atsProvider || null,
        atsApiKey:   atsApiKey ? encrypt(atsApiKey) : null,
      },
    });

    revalidatePath("/dashboard/referrer/profile");
    return { success: "ATS configuration saved securely." };
  } catch (err) {
    console.error("[UPDATE_ATS_CONFIG]", err);
    return { error: "Failed to save ATS configuration." };
  }
}

/**
 * Retrieves and decrypts the ATS API key for server-side use only.
 * Never expose the decrypted key to the client.
 */
export async function getDecryptedAtsKey(
  referrerProfileId: string
): Promise<string | null> {
  const profile = await db.referrerProfile.findUnique({
    where: { id: referrerProfileId },
    select: { atsApiKey: true },
  });

  if (!profile?.atsApiKey) return null;

  try {
    return decrypt(profile.atsApiKey);
  } catch {
    console.error("[ATS] Failed to decrypt API key for profile:", referrerProfileId);
    return null;
  }
}
