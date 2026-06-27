import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import LinkedIn from "next-auth/providers/linkedin";

/**
 * Edge-compatible auth config.
 *
 * This file MUST NOT import anything that depends on Node.js APIs
 * (e.g., PrismaClient, node:crypto, bcryptjs).  It is imported by
 * middleware.ts, which runs in the Edge Runtime on Vercel.
 *
 * The full auth configuration (with PrismaAdapter and the authorize
 * callback) lives in auth.ts and is used by Server Components and
 * Server Actions which run in the Node.js runtime.
 */
export const authConfig = {
  // No adapter here – adapter is Node-only (PrismaAdapter)
  trustHost: true,
  session: {
    strategy: "jwt" as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Credentials provider with a no-op authorize – the real authorize
    // logic lives in auth.ts.  We still need to declare the provider here
    // so that the middleware knows it's valid.
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        return null;
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
    jwt({ token, user, account, trigger, session }: any) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role || "SEEKER";
        token.isAdmin = user.isAdmin || false;

        delete token.name;
        delete token.email;
        delete token.picture;
        delete token.sub;

        if (account && account.provider !== "credentials") {
          token.emailVerified = user.emailVerified ?? new Date();
        } else {
          token.emailVerified = user.emailVerified || null;
        }
      }
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      return token;
    },
    session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isAdmin = token.isAdmin;
        session.user.emailVerified = token.emailVerified
          ? new Date(token.emailVerified)
          : null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
