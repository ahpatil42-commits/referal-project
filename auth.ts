import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import LinkedIn from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
  session: { 
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        // Dynamically import bcryptjs to avoid Edge Runtime issues in NextAuth middleware
        const bcrypt = await import("bcryptjs");

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordsMatch) return null;

        const sessionUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role as "SEEKER" | "REFERRER",
          isAdmin: user.isAdmin,
          emailVerified: user.emailVerified,
        };
        console.log("[Auth] Authorize returned:", sessionUser);
        return sessionUser;
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    }),
    LinkedIn({
      clientId: process.env.AUTH_LINKEDIN_ID,
      clientSecret: process.env.AUTH_LINKEDIN_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // `user` is only populated on initial sign-in
      if (user) {
        console.log("[Auth] JWT callback received user:", user);
        token.id = user.id as string;
        token.role = (user as any).role || "SEEKER"; // Default role for OAuth signups
        token.isAdmin = (user as any).isAdmin || false;
        token.emailVerified = (user as any).emailVerified || null;
      }
      console.log("[Auth] JWT returning token:", token);
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "SEEKER" | "REFERRER";
        // @ts-expect-error - Custom property added to session
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.emailVerified = token.emailVerified ? new Date(token.emailVerified as string) : null;
      }
      console.log("[Auth] Session returning:", session);
      return session;
    },
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
