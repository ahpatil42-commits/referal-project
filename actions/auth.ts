"use server";

import { signIn } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

const registerRateLimit = new Map<string, { count: number; timestamp: number }>();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
  role: z.enum(["SEEKER", "REFERRER"]),
  corporateEmail: z.string().optional(),
});

export async function signInWithProvider(provider: "google" | "facebook" | "linkedin") {
  await signIn(provider, { redirectTo: "/dashboard" });
}

export async function registerUser(data: {
  email: string;
  password: string;
  role: "SEEKER" | "REFERRER";
  corporateEmail?: string;
}) {
  try {
    const parsed = RegisterSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Invalid registration data provided" };
    }

    // Rate Limiting (Max 5 attempts per IP/Email per hour)
    const rateKey = data.email.toLowerCase();
    const now = Date.now();
    const rateData = registerRateLimit.get(rateKey) || { count: 0, timestamp: now };
    if (now - rateData.timestamp > 3600000) {
      rateData.count = 0;
      rateData.timestamp = now;
    }
    if (rateData.count >= 5) {
      return { error: "Too many registration attempts. Please try again later." };
    }
    rateData.count += 1;
    registerRateLimit.set(rateKey, rateData);

    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: "Email already exists" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    await db.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.email.split("@")[0],
        role: data.role,
        ...(data.role === "REFERRER" && data.corporateEmail
          ? {
              referrerProfile: {
                create: {
                  corporateEmail: data.corporateEmail,
                },
              },
            }
          : {}),
      },
    });

    // Create Verification Token
    const token = crypto.randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: {
        identifier: data.email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

    // Normally you'd send an email here using Resend or similar.
    // For local development, we print the verification URL to the console:
    console.log("\n=============================================");
    console.log("   📧 EMAIL VERIFICATION LINK GENERATED   ");
    console.log("=============================================");
    console.log(`Click to verify: http://localhost:3000/verify-email?token=${token}`);
    console.log("=============================================\n");

    return { success: "Account created successfully" };
  } catch (error) {
    return { error: "Something went wrong" };
  }
}
