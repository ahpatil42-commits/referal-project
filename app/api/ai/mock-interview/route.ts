import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy_key" });

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, jobTitle, company, coverNote } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const seekerProfile = await db.seekerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!seekerProfile) {
      return NextResponse.json({ error: "Seeker profile not found" }, { status: 404 });
    }

    const systemPrompt = `You are an AI acting as a senior hiring manager at ${company} for the ${jobTitle} role.
The candidate (Seeker) wants a referral. Here is their profile and cover note:
Headline: ${seekerProfile.headline || "N/A"}
Bio: ${seekerProfile.bio || "N/A"}
Skills: ${seekerProfile.skills || "N/A"}
Cover Note: ${coverNote}

Your goal is to conduct a short "Mock Interview".
1. Ask exactly ONE tough, role-specific question to test their actual knowledge based on their skills and the role.
2. When they answer, evaluate it. If they answer poorly, offer constructive feedback and ask them to try again.
3. If they answer well and demonstrate competence, you MUST include the exact string "[VERIFIED]" in your response to approve them for the referral.

Be professional but firm. Keep your responses concise (under 100 words).`;

    // Convert conversation history to Gemini format
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Understood. I will begin the mock interview now." }] }
    ];

    for (const msg of messages) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const aiMessage = response.text || "";

    return NextResponse.json({ text: aiMessage });

  } catch (error: any) {
    console.error("[MOCK_INTERVIEW_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
