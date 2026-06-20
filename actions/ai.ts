"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function getMatchExplanation(referrerId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    const seeker = await db.seekerProfile.findUnique({ where: { userId: session.user.id } });
    if (!seeker) return { error: "Seeker profile not found" };

    const referrer = await db.referrerProfile.findUnique({ where: { id: referrerId } });
    if (!referrer) return { error: "Referrer profile not found" };

    const prompt = `
      You are an expert recruiter AI. 
      Analyze the job seeker and the potential referrer and explain in ONE short, encouraging sentence why they are a good match for a referral.
      
      Seeker Profile:
      Headline: ${seeker.headline || "N/A"}
      Bio: ${seeker.bio || "N/A"}
      Skills: ${seeker.skills || "N/A"}
      Target Roles: ${seeker.targetRoles || "N/A"}

      Referrer Profile:
      Company: ${referrer.company || "N/A"}
      Job Title: ${referrer.jobTitle || "N/A"}
      Bio: ${referrer.bio || "N/A"}

      Respond with ONLY the one sentence. No quotes, no intro.
    `;

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: prompt,
      });

      const explanation = response.text || "You are a strong match for this referral!";
      return { success: explanation.trim() };
    } catch (apiError) {
      console.warn("Gemini connection failed, using fallback:", apiError);
      return { 
        success: "Since you both share common professional domains, you appear to be a great match for a referral!" 
      };
    }
  } catch (error: any) {
    console.error("AI Explanation Error:", error);
    return { error: "Failed to generate explanation." };
  }
}
