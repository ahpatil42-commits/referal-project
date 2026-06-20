import { NextResponse } from "next/server";
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

    // Simulated Extraction Heuristics (Since we're not using OpenAI keys)
    const lowerText = text.toLowerCase();
    
    // 1. Find common skills
    const commonSkills = ["react", "node", "typescript", "python", "java", "c++", "aws", "docker", "kubernetes", "sql", "graphql", "machine learning", "ui/ux", "figma"];
    const foundSkills = commonSkills.filter(skill => lowerText.includes(skill.toLowerCase()));

    // 2. Find target roles
    const commonRoles = ["software engineer", "frontend", "backend", "full stack", "data scientist", "product manager", "designer"];
    let primaryRole = "Software Engineer"; // fallback
    for (const role of commonRoles) {
      if (lowerText.includes(role)) {
        primaryRole = role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }

    // 3. Generate bio
    const headline = `${primaryRole} | Specializing in ${foundSkills.slice(0, 3).join(", ") || "building great software"}`;
    const bio = `I am a ${primaryRole} with experience in ${foundSkills.slice(0, 5).join(", ")}. I'm highly motivated and looking for new opportunities to grow and contribute to impactful projects.`;

    return NextResponse.json({
      headline,
      bio,
      skills: JSON.stringify(foundSkills.slice(0, 10)),
      targetRoles: JSON.stringify([primaryRole]),
      resumeStoragePath
    });
  } catch (error) {
    console.error("Resume parse error:", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
