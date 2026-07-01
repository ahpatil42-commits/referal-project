"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Ensure the user calling this is an ADMIN
async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }
  
  // Directly query the database to ensure we get the latest isAdmin status
  // without relying on the JWT cookie which might be stale
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true }
  });

  if (!user || !user.isAdmin) {
    redirect("/");
  }
}

export async function getPlatformStats() {
  await verifyAdmin();

  const [totalUsers, totalSeekers, totalReferrers, totalRequests, acceptedRequests, proUsers] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "SEEKER" } }),
    db.user.count({ where: { role: "REFERRER" } }),
    db.referralRequest.count(),
    db.referralRequest.count({ where: { status: "ACCEPTED" } }),
    db.user.count({ where: { plan: "PRO" } })
  ]);

  const acceptanceRate = totalRequests > 0 
    ? Math.round((acceptedRequests / totalRequests) * 100) 
    : 0;

  const proPriceUsd = parseInt(process.env.STRIPE_PRO_PRICE || "19", 10);

  return {
    totalUsers,
    totalSeekers,
    totalReferrers,
    totalRequests,
    acceptanceRate,
    proUsers,
    mrr: proUsers * proPriceUsd,
  };
}

export async function getRecentUsers() {
  await verifyAdmin();

  return await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isAdmin: true,
      isSuspended: true,
      createdAt: true,
      lastLoginAt: true,
      seekerProfile: {
        select: {
          _count: {
            select: { sentRequests: true }
          }
        }
      },
      referrerProfile: {
        select: {
          _count: {
            select: { receivedRequests: true }
          }
        }
      }
    },
  });
}

export async function toggleUserSuspension(userId: string, isSuspended: boolean) {
  await verifyAdmin();

  try {
    await db.user.update({
      where: { id: userId },
      data: { isSuspended },
    });
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    import('./../lib/logger').then(({ logger }) => {
      logger.error({ msg: 'Failed to toggle suspension', error });
    });
    return { error: "Failed to update user." };
  }
}
