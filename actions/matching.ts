"use server";

interface SeekerData {
  skills: any;       
  targetRoles: any;  
  headline: string | null;
  bio: string | null;
}

interface ReferrerData {
  id?: string;
  company: string | null;
  jobTitle: string | null;
  bio: string | null;
}

import { Redis } from "@upstash/redis";
import { logAIFailure } from "@/lib/logger";

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});


const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * Calculates an "AI Match Score" (0-100) using Ollama to predict compatibility.
 * Falls back to keyword matching if Ollama fails or times out.
 */
export async function calculateMatchScore(seeker: SeekerData | null, referrer: ReferrerData): Promise<number> {
  if (!seeker) return 0;
  
  // Try Cache First
  const seekerIdentifier = (seeker as any).userId || (seeker as any).id || "unknown";
  const referrerIdentifier = referrer.id || "unknown";
  const cacheKey = `match_score:${seekerIdentifier}:${referrerIdentifier}`;
  
  try {
    const cached = await redis.get<number>(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (e) {
    // Ignore redis error and compute
  }

  // 1. Calculate a Fallback Score (Keyword Match)
  let fallbackScore = 30; 
  let keywords: string[] = [];
  try {
    const skills = Array.isArray(seeker.skills) ? seeker.skills : [];
    const roles = Array.isArray(seeker.targetRoles) ? seeker.targetRoles : [];
    keywords = [...skills, ...roles];
  } catch (e) {}

  if (seeker.headline) keywords.push(...seeker.headline.split(" "));
  keywords = keywords
    .map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((k) => k.length > 2); 

  if (keywords.length === 0) {
    return 35 + Math.floor(Math.random() * 25); 
  }

  const refText = [referrer.company, referrer.jobTitle, referrer.bio]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let matches = 0;
  for (const kw of keywords) {
    if (refText.includes(kw)) matches++;
  }
  
  fallbackScore += Math.min(70, matches * 15);
  fallbackScore = Math.min(99, Math.max(10, fallbackScore));

  // 2. GEMINI AI Prediction
  const prompt = `
    You are an expert technical recruiter matching a job seeker with a referrer at a company.
    Based on the seeker's resume details and the referrer's job profile, predict their match score from 0 to 100.
    100 means a perfect match (e.g. software engineer seeking software engineer role in the exact same tech stack).
    0 means completely irrelevant.

    Seeker Resume Details:
    Headline: ${seeker.headline || "N/A"}
    Bio: ${seeker.bio || "N/A"}
    Skills: ${Array.isArray(seeker.skills) ? seeker.skills.join(", ") : "N/A"}
    Target Roles: ${Array.isArray(seeker.targetRoles) ? seeker.targetRoles.join(", ") : "N/A"}

    Referrer Job Profile:
    Company: ${referrer.company || "N/A"}
    Job Title: ${referrer.jobTitle || "N/A"}
    Bio: ${referrer.bio || "N/A"}

    Respond with ONLY the integer number between 0 and 100. Do not include any text, reasoning, quotes, or punctuation.
  `;

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return fallbackScore;
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
    });

    const match = response.text?.match(/\d+/);
    if (match) {
      const parsedScore = parseInt(match[0], 10);
      if (parsedScore >= 0 && parsedScore <= 100) {
        await redis.set(cacheKey, parsedScore, { ex: CACHE_TTL_SECONDS }).catch(() => {});
        return parsedScore;
      }
    }
    
    await redis.set(cacheKey, fallbackScore, { ex: CACHE_TTL_SECONDS }).catch(() => {});
    return fallbackScore;

  } catch (error) {
    logAIFailure("calculateMatchScore", error, { seekerIdentifier, referrerIdentifier });
    await redis.set(cacheKey, fallbackScore, { ex: CACHE_TTL_SECONDS }).catch(() => {});
    return fallbackScore;
  }
}
