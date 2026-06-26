"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendEmailNotification } from "@/lib/mail";
import { actionRateLimiter } from "@/lib/rate-limit";
import { pusherServer } from "@/lib/pusher";
import { getBaseUrl } from "@/lib/url";

// ── Profile ──────────────────────────────────────────────────────────────────

const SeekerProfileSchema = z.object({
  headline:    z.string().max(120).optional(),
  bio:         z.string().max(800).optional(),
  skills:      z.array(z.string()).optional(),
  resumeUrl:   z.string().url().optional().or(z.literal("")),
  resumeStoragePath: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl:   z.string().url().optional().or(z.literal("")),
  targetRoles: z.array(z.string()).optional(),
});

export type SeekerProfileValues = z.infer<typeof SeekerProfileSchema>;

export async function updateSeekerProfile(
  values: SeekerProfileValues
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  if (session.user.role !== "SEEKER") return { error: "Unauthorized access." };

  const rateLimit = await actionRateLimiter.check(session.user.id);
  if (!rateLimit.success) return { error: "Too many requests. Please wait a minute." };

  const validated = SeekerProfileSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid data." };

  const data = validated.data;

  try {
    await db.seekerProfile.upsert({
      where:  { userId: session.user.id },
      update: {
        headline:    data.headline    || null,
        bio:         data.bio         || null,
        skills:      data.skills      ?? Prisma.DbNull,
        resumeUrl:   data.resumeUrl   || null,
        resumeStoragePath: data.resumeStoragePath || null,
        linkedinUrl: data.linkedinUrl || null,
        githubUrl:   data.githubUrl   || null,
        targetRoles: data.targetRoles ?? Prisma.DbNull,
      },
      create: {
        userId:      session.user.id,
        headline:    data.headline    || null,
        bio:         data.bio         || null,
        skills:      data.skills      ?? Prisma.DbNull,
        resumeUrl:   data.resumeUrl   || null,
        resumeStoragePath: data.resumeStoragePath || null,
        linkedinUrl: data.linkedinUrl || null,
        githubUrl:   data.githubUrl   || null,
        targetRoles: data.targetRoles ?? Prisma.DbNull,
      },
    });

    revalidatePath("/dashboard/seeker/profile");
    revalidatePath("/dashboard/seeker");
    return { success: "Profile updated!" };
  } catch (err) {
    console.error("[UPDATE_SEEKER_PROFILE]", err);
    return { error: "Failed to save profile." };
  }
}

// ── Referral Requests ─────────────────────────────────────────────────────────

const SendRequestSchema = z.object({
  referrerId: z.string().min(1),
  jobTitle:   z.string().min(2, "Job title is required"),
  company:    z.string().min(2, "Company is required"),
  jobUrl:     z.string().url().optional().or(z.literal("")),
  coverNote:  z.string().min(30, "Please write at least 30 characters").max(1000),
});

export type SendRequestValues = z.infer<typeof SendRequestSchema>;

export async function sendReferralRequest(
  values: SendRequestValues
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  if (session.user.role !== "SEEKER") return { error: "Only seekers can send requests." };

  const rateLimit = await actionRateLimiter.check(session.user.id);
  if (!rateLimit.success) return { error: "Too many requests. Please wait a minute." };

  const validated = SendRequestSchema.safeParse(values);
  if (!validated.success) {
    return { error: validated.error.errors[0]?.message ?? "Invalid data." };
  }

  const { referrerId, jobTitle, company, jobUrl, coverNote } = validated.data;

  // Get seeker profile
  const seekerProfile = await db.seekerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!seekerProfile) return { error: "Please complete your profile first." };

  // Fetch referrer profile to check quota
  const referrerProfile = await db.referrerProfile.findUnique({
    where: { id: referrerId },
    include: { user: true }
  });
  if (!referrerProfile) return { error: "Referrer not found." };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const acceptedRequestsCount = await db.referralRequest.count({
    where: {
      referrerId: referrerId,
      status: "ACCEPTED",
      createdAt: { gte: startOfMonth },
    },
  });

  if (acceptedRequestsCount >= referrerProfile.maxReferrals) {
    return { error: "This referrer has reached their referral limit for the month." };
  }

  // Also prevent inbox flooding — cap total PENDING requests at 3x the referrer's maxReferrals
  const pendingRequestsCount = await db.referralRequest.count({
    where: {
      referrerId,
      status: "PENDING",
    },
  });

  if (pendingRequestsCount >= referrerProfile.maxReferrals * 3) {
    return { error: "This referrer's inbox is full right now. Please try again later." };
  }

  // Prevent duplicate pending requests to the same referrer
  const existing = await db.referralRequest.findFirst({
    where: {
      seekerId:   seekerProfile.id,
      referrerId,
      status:     "PENDING",
    },
  });
  if (existing) return { error: "You already have a pending request with this referrer." };

  try {
    await db.referralRequest.create({
      data: {
        seekerId:   seekerProfile.id,
        referrerId,
        jobTitle,
        company,
        jobUrl:    jobUrl || null,
        coverNote,
        status:    "PENDING",
      },
    });

    if (referrerProfile?.user?.email) {
      await sendEmailNotification(
        referrerProfile.user.email,
        `New Referral Request from ${session.user.name || "a candidate"}`,
        `You have received a new referral request from ${session.user.name || "a candidate"} for the ${jobTitle} role at ${company}.\n\nLog in to review: ${getBaseUrl()}/dashboard/referrer/requests`
      );
    }

    revalidatePath("/dashboard/seeker/requests");
    revalidatePath("/dashboard/referrer/requests");

    // Notify Referrer
    if (referrerProfile?.userId) {
      await db.notification.create({
        data: {
          userId: referrerProfile.userId,
          title: "New Referral Request",
          message: `${session.user.name || session.user.email} requested a referral for ${jobTitle} at ${company}.`,
          link: "/dashboard/referrer/requests"
        }
      });

      // Send Real-Time Pusher Notification
      await pusherServer.trigger(`user-${referrerProfile.userId}`, "new-notification", {
        title: "New Referral Request",
        message: `${session.user.name || session.user.email} requested a referral for ${jobTitle} at ${company}.`,
        link: "/dashboard/referrer/requests"
      });
    }

    return { success: "Referral request sent successfully!" };
  } catch (err) {
    console.error("[SEND_REFERRAL_REQUEST]", err);
    return { error: "Failed to send request." };
  }
}
