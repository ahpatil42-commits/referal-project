"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { pusherServer } from "@/lib/pusher";

export async function sendMessage(requestId: string, content: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // Verify user is part of this request
    const request = await db.referralRequest.findUnique({
      where: { id: requestId },
      include: { seeker: true, referrer: true },
    });

    if (!request) return { error: "Request not found" };

    const isParticipant =
      request.seeker.userId === session.user.id ||
      request.referrer.userId === session.user.id;

    if (!isParticipant) return { error: "Unauthorized" };

    // Save message to DB
    const message = await db.message.create({
      data: {
        requestId,
        senderId: session.user.id,
        content,
      },
      include: {
        sender: {
          select: { name: true, image: true },
        },
      },
    });

    // Trigger Pusher event (fail gracefully if not configured)
    try {
      await pusherServer.trigger(`chat-request-${requestId}`, "new-message", message);
    } catch (pusherError) {
      console.warn("Pusher trigger failed (missing keys?):", pusherError);
    }

    return { success: true, message };
  } catch (error) {
    console.error("Failed to send message:", error);
    return { error: "Failed to send message" };
  }
}

export async function getMessages(requestId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const request = await db.referralRequest.findUnique({
      where: { id: requestId },
      include: { seeker: true, referrer: true },
    });

    if (!request) return { error: "Request not found" };

    const isParticipant =
      request.seeker.userId === session.user.id ||
      request.referrer.userId === session.user.id;

    if (!isParticipant) return { error: "Unauthorized" };

    const messages = await db.message.findMany({
      where: { requestId },
      include: {
        sender: {
          select: { name: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return { messages };
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return { error: "Failed to fetch messages" };
  }
}
