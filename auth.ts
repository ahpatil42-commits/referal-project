import { createSSRClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

/**
 * Universal auth() function replacing NextAuth.
 * This reads the Supabase JWT cookie and fetches the Prisma User from the DB.
 * It returns an object identical to the old NextAuth session object so that
 * all 35+ dashboard files work without any modification!
 */
export async function auth() {
  try {
    const supabase = await createSSRClient();
    const { data: authData, error } = await supabase.auth.getUser();

    if (error || !authData?.user?.email) {
      return null;
    }

    // We must fetch the user from Prisma to get the correct UUID for foreign keys.
    // Supabase Auth UUID (authData.user.id) is DIFFERENT from Prisma User UUID (dbUser.id)
    // because Prisma generates its own cuid/uuid when we call db.user.create()
    const dbUser = await db.user.findUnique({
      where: { email: authData.user.email },
    });

    if (!dbUser) {
      return null;
    }

    return {
      expires: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role as "SEEKER" | "REFERRER",
        isAdmin: dbUser.isAdmin,
        emailVerified: authData.user.email_confirmed_at 
          ? new Date(authData.user.email_confirmed_at) 
          : null,
        image: dbUser.image,
      }
    };
  } catch (err) {
    console.error("Auth wrapper error:", err);
    return null;
  }
}

// Stub out signIn and signOut to prevent import errors in any legacy files.
// Real auth actions should use Supabase directly.
export async function signIn() {
  throw new Error("Do not use signIn from @/auth anymore. Use Supabase signIn.");
}

export async function signOut() {
  throw new Error("Do not use signOut from @/auth anymore. Use Supabase signOut.");
}
