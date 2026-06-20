"use server";

interface SeekerData {
  skills: string | null;       
  targetRoles: string | null;  
  headline: string | null;
  bio: string | null;
}

interface ReferrerData {
  company: string | null;
  jobTitle: string | null;
  bio: string | null;
}

/**
 * Calculates an "AI Match Score" (0-100) using Ollama to predict compatibility.
 * Falls back to keyword matching if Ollama fails or times out.
 */
export async function calculateMatchScore(seeker: SeekerData | null, referrer: ReferrerData): Promise<number> {
  if (!seeker) return 0;
  
  // 1. Calculate a Fallback Score (Keyword Match)
  let fallbackScore = 30; 
  let keywords: string[] = [];
  try {
    const skills = seeker.skills ? JSON.parse(seeker.skills) : [];
    const roles = seeker.targetRoles ? JSON.parse(seeker.targetRoles) : [];
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
  const variance = Math.floor(Math.random() * 11) - 5;
  fallbackScore = Math.min(99, Math.max(10, fallbackScore + variance));

  // 2. GEMINI AI Prediction
  const prompt = `
    You are an expert technical recruiter matching a job seeker with a referrer at a company.
    Based on the seeker's resume details and the referrer's job profile, predict their match score from 0 to 100.
    100 means a perfect match (e.g. software engineer seeking software engineer role in the exact same tech stack).
    0 means completely irrelevant.

    Seeker Resume Details:
    Headline: ${seeker.headline || "N/A"}
    Bio: ${seeker.bio || "N/A"}
    Skills: ${seeker.skills || "N/A"}
    Target Roles: ${seeker.targetRoles || "N/A"}

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
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const match = response.text?.match(/\d+/);
    if (match) {
      const parsedScore = parseInt(match[0], 10);
      if (parsedScore >= 0 && parsedScore <= 100) {
        return parsedScore;
      }
    }
    
    return fallbackScore;

  } catch (error) {
    // If Ollama is unavailable, offline, or timed out
    // Silently fallback so the UI remains usable
    return fallbackScore;
  }
}
