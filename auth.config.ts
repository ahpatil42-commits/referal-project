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
export const authConfig: NextAuthConfig = {
  // No adapter here – adapter is Node-only (PrismaAdapter)
  trustHost: true,
  session: {
    strategy: "jwt",
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
        // This will never actually be called from middleware –
        // sign-in goes through the full auth.ts config.
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
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role || "SEEKER";
        token.isAdmin = (user as any).isAdmin || false;

        // Strip large default fields to prevent HTTP 431 errors
        delete token.name;
        delete token.email;
        delete token.picture;
        delete token.sub;

        // For OAuth providers, trust provider-verified email
        if (account && account.provider !== "credentials") {
          token.emailVerified = (user as any).emailVerified ?? new Date();
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
        session.user.emailVerified = token.emailVerified
          ? new Date(token.emailVerified as string)
          : null;
      }
      return session;
    },

    // authorized callback is used by middleware to check auth
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isDashboard) {
        // Returning true/false from here controls access.
        // We return true to let our custom middleware logic handle redirects.
        return true;
      }
      return true;
    },
  },
};
