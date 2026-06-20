"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function switchUserRole(newRole: "SEEKER" | "REFERRER") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { role: newRole },
    });
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[SWITCH_ROLE]", error);
    return { error: "Failed to switch role." };
  }
}
