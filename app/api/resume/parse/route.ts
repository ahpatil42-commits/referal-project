import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
// Use require for pdf-parse as it doesn't have a default export
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
import path from "path";
import { apiRateLimiter } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = apiRateLimiter.check(session.user.id!);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
    }

    const body = await request.json();
    const fileUrl = body.url;
    if (!fileUrl) {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 });
    }

    // Fetch the file from the Uploadthing URL
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error("Failed to download file from cloud storage");
    }
    
    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ext is .pdf, .docx etc. We can get it from the URL
    const urlParts = fileUrl.split("/");
    const filename = urlParts[urlParts.length - 1] || "resume.pdf";
    const ext = path.extname(filename).toLowerCase();

    // Parse Content based on extension
    let text = "";
    if (ext === ".pdf") {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (ext === ".txt") {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // Check if GEMINI_API_KEY is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Falling back to simple heuristics.");
      // Fallback heuristics just in case
      return NextResponse.json({
        headline: "Software Professional",
        bio: "Experienced professional looking for new opportunities.",
        skills: JSON.stringify(["React", "Node.js", "TypeScript"]),
        targetRoles: JSON.stringify(["Software Engineer"]),
        resumeUrl: fileUrl,
        resumeStoragePath: fileUrl
      });
    }

    // Call Gemini AI to parse the resume accurately
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an expert technical recruiter. Analyze the following resume text and extract the information as a JSON object with the exact following keys:
- "headline": A professional headline based on their experience (e.g., "Senior Full Stack Engineer").
- "bio": A short, compelling professional summary written in the first person (max 3 sentences).
- "skills": An array of their top technical skills (max 10 strings).
- "targetRoles": An array of potential job roles this person is fit for (e.g., ["Software Engineer", "Frontend Developer"]).
- "linkedinUrl": Their LinkedIn profile URL if found, otherwise null.
- "githubUrl": Their GitHub profile URL if found, otherwise null.

Resume Text:
${text.substring(0, 15000)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
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

    return NextResponse.json({
      headline: parsedData.headline || "Professional",
      bio: parsedData.bio || "",
      skills: JSON.stringify(parsedData.skills || []),
      targetRoles: JSON.stringify(parsedData.targetRoles || []),
      linkedinUrl: parsedData.linkedinUrl || "",
      githubUrl: parsedData.githubUrl || "",
      resumeUrl: fileUrl,
      resumeStoragePath: fileUrl
    });
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to parse resume" }, { status: 500 });
  }
}
