"use server";

import { signIn } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { sendPasswordResetEmail, sendCorporateVerificationEmail, sendOTPEmail } from "@/lib/mail";
import { createClient } from "@supabase/supabase-js";
import { createSSRClient } from "@/lib/supabase/server";

import { authRateLimiter } from "@/lib/rate-limit";
import { ensureProfileNumber } from "@/lib/profile";

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

export async function forgotPassword(email: string) {
  try {
    const supabase = await createSSRClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
    });
    if (error) {
      console.error("[Server Action] forgotPassword error:", error);
      return { error: `Failed to send reset link: ${error.message}` };
    }
    return { success: true };
  } catch (error: any) {
    console.error("[Server Action] forgotPassword exception:", error);
    return { error: `Something went wrong: ${error.message}` };
  }
}

export async function resetPassword(password: string, access_token: string, refresh_token: string) {
  try {
    const supabase = await createSSRClient();
    
    // Set the session using the tokens from the URL hash
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) {
      console.error("[Server Action] resetPassword session error:", sessionError);
      return { error: `Invalid or expired reset link: ${sessionError.message}` };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error("[Server Action] resetPassword error:", error);
      return { error: `Failed to reset password: ${error.message}` };
    }
    
    await supabase.auth.signOut();
    return { success: true };
  } catch (error: any) {
    console.error("[Server Action] resetPassword exception:", error);
    return { error: `Something went wrong: ${error.message}` };
  }
}

export async function loginUser(data: { email: string; password: string }) {
  try {
    const supabase = await createSSRClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error("[Server Action] Supabase login error:", error);
      return { error: `Server failed to connect to Auth: ${error.message}` };
    }

    // Enforce mandatory email verification
    if (!authData.user?.email_confirmed_at) {
      await supabase.auth.signOut();
      return { error: "Please verify your email address before logging in. Check your inbox for a confirmation link." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[Server Action] loginUser exception:", error);
    return { error: `Something went wrong: ${error.message || "Unknown error"}` };
  }
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

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (!anonKey.startsWith("eyJ")) {
      return { error: "CRITICAL ERROR: Your Vercel environment variables contain an invalid Supabase API key. It MUST start with 'eyJ'. Please go to Vercel Settings -> Environment Variables, update it, and redeploy." };
    }

    // 1. Sign up via Supabase (Server-side fetch prevents browser NetworkErrors)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey
    );
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { role: data.role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
      },
    });

    if (signUpError) {
      console.error("[Server Action] Supabase signUp error:", signUpError);
      return { error: `Server failed to connect to Auth: ${signUpError.message}` };
    }

    // 2. Create Prisma User
    const createdUser = await db.user.create({
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

    await ensureProfileNumber(createdUser.id);

    // [TEMPORARILY DISABLED] Generate 6-digit OTPs
    // const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // // Clear any existing OTPs for this email before creating a new one
    // await db.verificationOTP.deleteMany({
    //   where: { identifier: data.email }
    // });

    // await db.verificationOTP.create({
    //   data: {
    //     identifier: data.email,
    //     otp: emailOtp,
    //     expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    //   }
    // });

    // await sendOTPEmail(data.email, emailOtp);

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
      // TODO: Replace with a real SMS provider (e.g. Twilio) when ready.
      // For now, log to console so OTPs are visible in server logs during dev.
      console.log(`[SMS OTP] To: ${data.mobile} — Code: ${mobileOtp}`);

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
    
    // Redirect to the OTP verification page if mobile provided, else login
    if (data.mobile) {
      return { 
        success: "Account created! Please verify your mobile OTP.", 
        redirect: `/verify-otp?mobile=${encodeURIComponent(data.mobile)}`
      };
    }

    return {
      success: "Account created! You can now log in.",
      redirect: "/login"
    };
  } catch (error) {
    return { error: "Something went wrong" };
  }
}
