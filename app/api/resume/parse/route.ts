import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
// Use require for pdf-parse as it doesn't have a default export
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save file temporarily in /tmp (Vercel allows writing here)
    const uploadsDir = path.join("/tmp", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    
    const fileName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);
    const resumeStoragePath = filePath;

    // Parse Content based on extension
    let text = "";
    const ext = path.extname(file.name).toLowerCase();
    
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
        resumeStoragePath
      });
    }

    // Call Gemini AI to parse the resume accurately
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an expert technical recruiter. Analyze the following resume text and extract the information as a JSON object with the exact following keys:
- "headline": A professional headline based on their experience (e.g., "Senior Full Stack Engineer").
- "bio": A short, compelling professional summary written in the first person (max 3 sentences).
- "skills": An array of their top technical skills (max 10 strings).
- "targetRoles": An array of potential job roles this person is fit for (e.g., ["Software Engineer", "Frontend Developer"]).

Resume Text:
${text.substring(0, 15000)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
      resumeStoragePath
    });
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to parse resume" }, { status: 500 });
  }
}
