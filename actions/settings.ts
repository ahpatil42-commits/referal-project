"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendOTPEmail } from "@/lib/mail";
import { sendSMSOTP } from "@/lib/sms";

export async function updateMobileNumber(mobile: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    // check if another user has this mobile
    const existing = await db.user.findUnique({ where: { mobile } });
    if (existing && existing.id !== session.user.id) {
      return { error: "This mobile number is already in use by another account." };
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { mobile, mobileVerified: null },
    });
    
    revalidatePath("/dashboard/settings");
    return { success: "Mobile number updated. Please verify it." };
  } catch (error) {
    return { error: "Failed to update mobile number." };
  }
}

export async function sendVerificationOtp(type: "email" | "mobile") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { error: "User not found" };

    const identifier = type === "email" ? user.email : user.mobile;
    if (!identifier) return { error: `No ${type} associated with this account.` };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await db.verificationOTP.create({
      data: {
        identifier,
        otp,
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      }
    });

    if (type === "email") {
      await sendOTPEmail(identifier, otp);
    } else {
      await sendSMSOTP(identifier, otp);
    }

    return { 
      success: `Verification code sent to your ${type}.`
    };
  } catch (error) {
    return { error: "Failed to send verification code." };
  }
}

export async function verifyOtp(type: "email" | "mobile", otp: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { error: "User not found" };

    const identifier = type === "email" ? user.email : user.mobile;
    if (!identifier) return { error: `No ${type} associated with this account.` };

    const otpRecord = await db.verificationOTP.findUnique({
      where: {
        identifier_otp: {
          identifier,
          otp,
        },
      },
    });

    if (!otpRecord) return { error: "Invalid verification code." };
    if (otpRecord.expires < new Date()) return { error: "Verification code has expired." };

    await db.user.update({
      where: { id: session.user.id },
      data: type === "email" ? { emailVerified: new Date() } : { mobileVerified: new Date() },
    });

    await db.verificationOTP.delete({ where: { id: otpRecord.id } });
    
    revalidatePath("/dashboard/settings");
    return { success: `${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!` };
  } catch (error) {
    return { error: "Verification failed." };
  }
}

export async function updateProfileImage(url: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { image: url }
    });
    revalidatePath("/dashboard");
    return { success: "Profile photo updated!" };
  } catch (error) {
    return { error: "Failed to update profile photo." };
  }
}
