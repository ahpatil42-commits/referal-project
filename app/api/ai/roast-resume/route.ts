import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenAI } from "@google/genai";
import { apiRateLimiter } from "@/lib/rate-limit-edge";
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
import path from "path";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SEEKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await apiRateLimiter.check(session.user.id!);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let resumeText = "";
    const ext = path.extname(file.name).toLowerCase();
    
    if (ext === ".pdf") {
      const data = await pdfParse(buffer);
      resumeText = data.text;
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;
    } else if (ext === ".txt") {
      resumeText = buffer.toString("utf-8");
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json({ error: "Could not extract sufficient text from resume." }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
      You are an expert, highly critical (but fair) Tech Recruiter.
      A candidate has submitted the following text extracted from their resume.
      Analyze it for ATS compatibility, impact (metrics/results), clarity, and relevance to tech roles.
      
      Resume Text:
      ${resumeText.substring(0, 15000)}
      
      Respond STRICTLY in the following JSON format without markdown wrapping, just the raw JSON:
      {
        "score": <number between 1 and 100>,
        "feedback": [
          "<feedback point 1>",
          "<feedback point 2>",
          "<feedback point 3>"
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const textResponse = response.text || "{}";
    const result = JSON.parse(textResponse);

    return NextResponse.json(result);
  } catch (error) {
    import('@/lib/logger').then(({ logger }) => {
      logger.error({ msg: '[ROAST_RESUME]', error });
    });
  }
}
