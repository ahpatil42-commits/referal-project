"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function exportUserData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      seekerProfile: true,
      referrerProfile: true,
      messages: true,
      notifications: true,
    }
  });

  return JSON.stringify(user, null, 2);
}

export async function deleteUserAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.user.delete({
    where: { id: session.user.id }
  });

  redirect("/login");
}
