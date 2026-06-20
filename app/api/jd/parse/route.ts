import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, type } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: "No Job Description provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback if no API key
      return NextResponse.json({
        jobTitle: "Software Engineer",
        company: "Example Corp",
        description: "We are looking for a talented engineer...",
        experience: "3+ years",
        skills: "React, Node.js",
        location: "Remote",
        coverNote: "Hi! I saw the posting and would love a referral. Thanks!"
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let prompt = "";
    
    if (type === "POSTING") {
      prompt = `You are an expert HR assistant. Analyze the following Job Description (JD) and extract the key information into a JSON object with the exact following keys:
- "jobTitle": The official job title.
- "company": The company name (if found, otherwise an empty string).
- "experience": Required years of experience (if found, otherwise an empty string).
- "skills": Key skills required, as a comma-separated string (if found, otherwise an empty string).
- "location": Job location or "Remote" (if found, otherwise an empty string).
- "description": A concise, 3-4 sentence summary of the role's responsibilities and top requirements.

Job Description Text:
${text.substring(0, 8000)}
`;
    } else {
      prompt = `You are an expert career coach. Analyze the following Job Description (JD) and extract the key information into a JSON object with the exact following keys:
- "jobTitle": The official job title.
- "company": The company name (if found, otherwise an empty string).
- "coverNote": A professional, confident 2-3 sentence cover note written in the first person. It should explain why the applicant is a great fit for this specific role, asking for a referral.

Job Description Text:
${text.substring(0, 8000)}
`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) {
      throw new Error("Failed to generate content from Gemini");
    }

    let jsonText = response.text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    const parsedData = JSON.parse(jsonText);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("JD parse error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to parse JD" }, { status: 500 });
  }
}
