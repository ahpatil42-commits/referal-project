"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { encrypt } from "@/lib/encryption";
import { actionRateLimiter } from "@/lib/rate-limit";

const AtsSettingsSchema = z.object({
  atsProvider: z.string().min(1, "Provider is required"),
  atsApiKey: z.string().min(1, "API Key is required"),
});

export async function updateAtsSettings(
  values: z.infer<typeof AtsSettingsSchema>
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  if (session.user.role !== "REFERRER") return { error: "Unauthorized access." };

  const rateLimit = await actionRateLimiter.check(session.user.id);
  if (!rateLimit.success) return { error: "Too many requests. Please wait a minute." };

  const validated = AtsSettingsSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid data." };

  const { atsProvider, atsApiKey } = validated.data;

  try {
    const encryptedKey = encrypt(atsApiKey);

    await db.referrerProfile.update({
      where: { userId: session.user.id },
      data: {
        atsProvider,
        atsApiKey: encryptedKey,
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/referrer/profile");
    return { success: "ATS Settings updated and encrypted!" };
  } catch (err) {
    console.error("[UPDATE_ATS_SETTINGS]", err);
    return { error: "Failed to update ATS settings." };
  }
}
