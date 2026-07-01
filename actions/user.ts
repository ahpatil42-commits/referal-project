"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function switchUserRole(newRole: "SEEKER" | "REFERRER") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    let needsSetup = false;
    if (newRole === "SEEKER") {
      let profile = await db.seekerProfile.findUnique({ where: { userId: session.user.id } });
      if (!profile) {
        profile = await db.seekerProfile.create({ data: { userId: session.user.id } });
        needsSetup = true;
      }
    } else {
      let profile = await db.referrerProfile.findUnique({ where: { userId: session.user.id } });
      if (!profile) {
        profile = await db.referrerProfile.create({ data: { userId: session.user.id } });
        needsSetup = true;
      }
    }

    // Update the active mode (role) in the user table
    await db.user.update({
      where: { id: session.user.id },
      data: { role: newRole },
    });
    
    // Determine redirect path
    let redirectUrl = newRole === "SEEKER" ? "/dashboard/seeker" : "/dashboard/referrer";
    if (needsSetup) {
      redirectUrl = newRole === "SEEKER" ? "/dashboard/seeker/profile" : "/dashboard/referrer/profile";
    }

    // Revalidate paths to clear cache
    revalidatePath("/dashboard");
    revalidatePath(redirectUrl);

    return { success: true, redirectUrl };
  } catch (error) {
    import('./../lib/logger').then(({ logger }) => {
      logger.error({ msg: '[SWITCH_ROLE]', error });
    });
    return { error: "Failed to switch role." };
  }
}

export async function acceptTermsOfService() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { termsAcceptedAt: new Date() }
    });
    return { success: true };
  } catch (error) {
    import('./../lib/logger').then(({ logger }) => {
      logger.error({ msg: '[ACCEPT_TERMS]', error });
    });
    return { error: "Failed to accept terms." };
  }
}
