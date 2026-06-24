"use server";

import { signIn } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { sendPasswordResetEmail, sendCorporateVerificationEmail, sendOTPEmail } from "@/lib/mail";
import { sendSMSOTP } from "@/lib/sms";

import { authRateLimiter } from "@/lib/rate-limit";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
  role: z.enum(["SEEKER", "REFERRER"]),
  corporateEmail: z.string().optional(),
  mobile: z.string().optional(),
});

export async function signInWithProvider(provider: "google" | "facebook" | "linkedin") {
  await signIn(provider, { redirectTo: "/dashboard" });
}

export async function registerUser(data: {
  email: string;
  password: string;
  role: "SEEKER" | "REFERRER";
  corporateEmail?: string;
  mobile?: string;
}) {
  try {
    const parsed = RegisterSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Invalid registration data provided" };
    }

    // Rate Limiting (Max 5 attempts per IP/Email per hour)
    const rateKey = data.email.toLowerCase();
    const rateLimit = await authRateLimiter.check(rateKey);
    
    if (!rateLimit.success) {
      return { error: "Too many registration attempts. Please try again later." };
    }

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
        mobile: data.mobile,
        termsAcceptedAt: new Date(),
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

    // Generate 6-digit OTPs
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Clear any existing OTPs for this email before creating a new one
    await db.verificationOTP.deleteMany({
      where: { identifier: data.email }
    });

    await db.verificationOTP.create({
      data: {
        identifier: data.email,
        otp: emailOtp,
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      }
    });

    await sendOTPEmail(data.email, emailOtp);

    let mobileOtp: string | undefined;
    if (data.mobile) {
      mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();
      // Clear any existing OTPs for this mobile before creating a new one
      await db.verificationOTP.deleteMany({
        where: { identifier: data.mobile }
      });
      await db.verificationOTP.create({
        data: {
          identifier: data.mobile,
          otp: mobileOtp,
          expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
        }
      });
      await sendSMSOTP(data.mobile, mobileOtp);
    }

    if (data.role === "REFERRER" && data.corporateEmail) {
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      await db.verificationToken.create({
        data: {
          identifier: data.corporateEmail,
          token,
          expires: new Date(Date.now() + 24 * 3600 * 1000)
        }
      });
      await sendCorporateVerificationEmail(data.corporateEmail, token);
    }
    
    // Redirect to the OTP verification page
    return { 
      success: "Account created! Please verify your OTPs.", 
      redirect: `/verify-otp?email=${encodeURIComponent(data.email)}${data.mobile ? `&mobile=${encodeURIComponent(data.mobile)}` : ''}`
    };
  } catch (error) {
    return { error: "Something went wrong" };
  }
}
