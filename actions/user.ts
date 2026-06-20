"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function switchUserRole(newRole: "SEEKER" | "REFERRER") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    // Check if the profile exists for the requested role
    let needsSetup = false;
    if (newRole === "SEEKER") {
      const profile = await db.seekerProfile.findUnique({ where: { userId: session.user.id } });
      if (!profile) needsSetup = true;
    } else {
      const profile = await db.referrerProfile.findUnique({ where: { userId: session.user.id } });
      if (!profile) needsSetup = true;
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
    console.error("[SWITCH_ROLE]", error);
    return { error: "Failed to switch role." };
  }
}
