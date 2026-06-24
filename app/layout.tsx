import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/components/providers/auth-provider";
import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

import { AnalyticsProvider } from "@/components/providers/analytics-provider";

export const metadata: Metadata = {
  title: {
    default: "ReferralAI — Your Referral Network, Supercharged by AI",
    template: "%s | ReferralAI",
  },
  description:
    "ReferralAI connects talented job seekers with professionals who can provide referrals at top companies. Land your dream job faster.",
  keywords: ["referrals", "job search", "networking", "AI", "career"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AnalyticsProvider userId={session?.user?.id}>
          <AuthProvider session={session}>
            <RealtimeProvider>
              {children}
            </RealtimeProvider>
          </AuthProvider>
        </AnalyticsProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
