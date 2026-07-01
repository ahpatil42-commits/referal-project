"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { pusherServer } from "@/lib/pusher";
import { sanitizeText } from "@/lib/sanitize";
import { z } from "zod";

const MessageSchema = z.object({
  requestId: z.string().cuid(),
  content:   z.string().min(1, "Message cannot be empty").max(2000, "Message is too long (max 2000 characters)"),
});

export async function sendMessage(requestId: string, content: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const validated = MessageSchema.safeParse({ requestId, content });
    if (!validated.success) {
      return { error: validated.error.errors[0]?.message ?? "Invalid message." };
    }

    const safeContent = sanitizeText(validated.data.content);
    if (!safeContent.trim()) return { error: "Message cannot be empty." };

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
        content: safeContent,
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
      import('./../lib/logger').then(({ logger }) => {
        logger.warn({ msg: 'Pusher trigger failed (missing keys?)', pusherError });
      });
    }

    return { success: true, message };
  } catch (error) {
    import('./../lib/logger').then(({ logger }) => {
      logger.error({ msg: 'Failed to send message', error });
    });
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
    import('./../lib/logger').then(({ logger }) => {
      logger.error({ msg: 'Failed to fetch messages', error });
    });
    return { error: "Failed to fetch messages" };
  }
}
