import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";

/**
 * Full auth configuration — Node.js runtime only.
 *
 * This extends the edge-safe authConfig with:
 *   - PrismaAdapter (requires PrismaClient → Node.js)
 *   - Credentials authorize() with bcryptjs password comparison
 *   - DB queries in session callback
 *   - signIn event with lastLoginAt update
 *
 * Only imported by Server Components, Server Actions, and API routes —
 * NEVER by middleware.ts (which runs in Edge Runtime on Vercel).
 */
export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  events: {
    async signIn({ user }) {
      if (user?.id) {
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(console.error);
      }
    },
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

        const bcrypt = await import("bcryptjs");
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordsMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role as "SEEKER" | "REFERRER",
          isAdmin: user.isAdmin,
          emailVerified: user.emailVerified,
        };
      },
    }),
    // Spread the remaining providers from authConfig (Google, Facebook, LinkedIn)
    // We need to re-declare them since NextAuth's providers array is replaced, not merged
    ...(authConfig.providers?.filter(
      (p: any) => p.id !== "credentials"
    ) ?? []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account, trigger, session }) {
      // Reuse the edge-safe jwt callback first
      const result = await authConfig.callbacks!.jwt!({ token, user, account, trigger, session } as any);

      // For OAuth sign-ins, fetch emailVerified from DB
      if (user && account && account.provider !== "credentials") {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: user.id as string },
            select: { emailVerified: true },
          });
          result.emailVerified = dbUser?.emailVerified ?? new Date();
        } catch {
          result.emailVerified = new Date();
        }
      }

      return result;
    },
    async session({ session, token }) {
      // Run the base session callback first
      const result = await authConfig.callbacks!.session!({ session, token } as any);

      // Enrich with DB data (only possible in Node runtime)
      if (token?.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, email: true },
          });
          if (dbUser && result.user) {
            result.user.name = dbUser.name;
            result.user.email = dbUser.email;
          }
        } catch (e) {
          console.error("Failed to fetch user data for session", e);
        }
      }

      return result;
    },
  },
});
