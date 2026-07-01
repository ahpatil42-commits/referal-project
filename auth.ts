import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import LinkedIn from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import type { NextAuthConfig } from "next-auth";

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== "production" ? "development-secret" : undefined);

export const authConfig: NextAuthConfig = {
  secret: authSecret,
  adapter: PrismaAdapter(db),
  trustHost: true,
  session: { 
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(console.error);
      }
    }
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
    async jwt({ token, user, account, trigger, session }) {
      // `user` is only populated on initial sign-in
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role || "SEEKER"; // Default role for OAuth signups
        token.isAdmin = (user as any).isAdmin || false;

        // Force strip potentially huge default fields from the JWT to prevent HTTP 431 errors
        delete token.name;
        delete token.email;
        delete token.picture;
        delete token.sub;

        // For OAuth providers, trust the provider-verified email.
        // Fetch from DB to get the canonical emailVerified value set by the PrismaAdapter.
        if (account && account.provider !== "credentials") {
          try {
            const dbUser = await db.user.findUnique({
              where: { id: user.id as string },
              select: { emailVerified: true },
            });
            token.emailVerified = dbUser?.emailVerified ?? new Date();
          } catch {
            // Fallback: trust the provider if DB lookup fails
            token.emailVerified = new Date();
          }
        } else {
          token.emailVerified = (user as any).emailVerified || null;
        }
      }
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
        
        // Fetch dynamic user data from the DB to keep the JWT token size ultra-minimal.
        // IMPORTANT: We deliberately do NOT include `image` here — Base64 data URIs
        // stored by the old /api/upload/image endpoint would bloat the session cookie
        // and cause Vercel's 494 REQUEST_HEADER_TOO_LARGE error on every page load.
        // Avatar images are fetched separately via /api/profile/avatar.
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, email: true },
          });
          if (dbUser) {
            session.user.name  = dbUser.name;
            session.user.email = dbUser.email;
            // Deliberately omit session.user.image – fetch via /api/profile/avatar instead
          }
        } catch (e) {
          import('./lib/logger').then(({ logger }) => {
            logger.error({ msg: 'Failed to fetch user data for session', error: e });
          });
        }
      }
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
