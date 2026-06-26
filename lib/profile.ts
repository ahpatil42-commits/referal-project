import crypto from "crypto";
import { db } from "@/lib/db";

export function generateProfileNumber(): string {
  return `REF-${crypto.randomInt(100000, 999999).toString().padStart(6, "0")}`;
}

export async function ensureProfileNumber(userId: string): Promise<string> {
  const existing = await db.user.findUnique({
    where: { id: userId },
    select: { profileNumber: true },
  });

  if (existing?.profileNumber) {
    return existing.profileNumber;
  }

  let candidate = generateProfileNumber();
  let attempts = 0;

  while (attempts < 10) {
    const taken = await db.user.findUnique({
      where: { profileNumber: candidate },
      select: { id: true },
    });

    if (!taken) {
      await db.user.update({
        where: { id: userId },
        data: { profileNumber: candidate },
      });
      return candidate;
    }

    candidate = generateProfileNumber();
    attempts += 1;
  }

  throw new Error("Unable to generate a unique profile number.");
}

export function buildUploadFileName(originalName: string, profileNumber: string, kind: "resume" | "avatar") {
  const extension = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")) : "";
  const baseName = originalName.replace(new RegExp(`${extension.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "");
  const safeBase = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || kind;
  const safeNumber = profileNumber.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "");
  return `${safeBase}-${safeNumber}${extension}`;
}
