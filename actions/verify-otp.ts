"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { authRateLimiter } from "@/lib/rate-limit";

const VerifySchema = z.object({
  email: z.string().email(),
  mobile: z.string().optional(),
  emailOtp: z.string().length(6, "Email OTP must be 6 digits"),
  mobileOtp: z.string().length(6, "Mobile OTP must be 6 digits").optional(),
});

export async function verifyOTP(data: {
  email: string;
  mobile?: string;
  emailOtp: string;
  mobileOtp?: string;
}) {
  try {
    const parsed = VerifySchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Invalid data provided" };
    }

    // Rate-limit OTP verification attempts per email
    const rateLimit = await authRateLimiter.check(`otp-verify:${data.email}`);
    if (!rateLimit.success) {
      return { error: "Too many verification attempts. Please wait before trying again." };
    }

    const user = await db.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Verify Email OTP
    const emailOTPRecord = await db.verificationOTP.findUnique({
      where: {
        identifier_otp: {
          identifier: data.email,
          otp: data.emailOtp,
        },
      },
    });

    if (!emailOTPRecord) {
      return { error: "Invalid Email OTP" };
    }

    if (emailOTPRecord.expires < new Date()) {
      return { error: "Email OTP has expired" };
    }

    // Verify Mobile OTP if mobile is provided
    let mobileOTPRecord = null;
    if (data.mobile && data.mobileOtp) {
      mobileOTPRecord = await db.verificationOTP.findUnique({
        where: {
          identifier_otp: {
            identifier: data.mobile,
            otp: data.mobileOtp,
          },
        },
      });

      if (!mobileOTPRecord) {
        return { error: "Invalid Mobile OTP" };
      }

      if (mobileOTPRecord.expires < new Date()) {
        return { error: "Mobile OTP has expired" };
      }
    }

    // Update User
    await db.user.update({
      where: { email: data.email },
      data: {
        emailVerified: new Date(),
        ...(data.mobile && data.mobileOtp ? { mobileVerified: new Date() } : {}),
      },
    });

    // Clean up OTPs
    await db.verificationOTP.delete({ where: { id: emailOTPRecord.id } });
    if (mobileOTPRecord) {
      await db.verificationOTP.delete({ where: { id: mobileOTPRecord.id } });
    }

    return { success: "Verification successful! You can now sign in." };
  } catch (error) {
    import('./../lib/logger').then(({ logger }) => {
      logger.error({ msg: 'Verification error', error });
    });
    return { error: "Something went wrong" };
  }
}
