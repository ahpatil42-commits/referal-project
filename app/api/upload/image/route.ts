import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate image extension (very basic)
    const ext = path.extname(file.name).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    // Save image as a Base64 Data URI string directly in the DB
    // This avoids Vercel's EROFS Read-Only File System error without needing AWS S3
    const mimeType = ext === ".jpg" ? "image/jpeg" : `image/${ext.slice(1)}`;
    const base64String = buffer.toString("base64");
    const imageUrl = `data:${mimeType};base64,${base64String}`;

    // Update user record in db
    await db.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl },
    });

    return NextResponse.json({
      imageUrl,
      success: true,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
