"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getFeedbacks() {
  const session = await auth();
  if (!session?.user?.id) return [];

  // In a real app, ensure user is ADMIN here
  const dbUser = await db.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser?.isAdmin) return [];

  return await db.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { email: true, name: true, role: true }
      }
    }
  });
}

export async function analyzeFeedbackWithAI() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const dbUser = await db.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser?.isAdmin) return { error: "Unauthorized" };

  try {
    const feedbacks = await db.feedback.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (feedbacks.length === 0) {
      return { error: "No feedback available to analyze." };
    }

    const feedbackText = feedbacks.map(f => `[${f.type}] - ${f.message}`).join("\n");

    const prompt = `
    You are an expert product manager analyzing user feedback for a platform called ReferralAI.
    Here is the raw feedback submitted by users:

    ${feedbackText}

    Please generate a concise, markdown-formatted report that includes:
    1. **Overall Sentiment**: A brief summary of how users feel (Positive/Negative/Neutral).
    2. **Top Feature Requests**: List the most requested features.
    3. **Critical Bugs**: Highlight any bugs that need immediate attention.
    4. **Actionable Takeaways**: 2-3 bullet points on what the engineering/design team should focus on next.
    
    Make it professional, scannable, and directly useful for the team.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return { analysis: response.text };
  } catch (error) {
    console.error("[AI_ANALYSIS_ERROR]", error);
    return { error: "Failed to generate AI analysis." };
  }
}
