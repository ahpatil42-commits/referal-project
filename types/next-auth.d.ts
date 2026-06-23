import type { DefaultSession } from "next-auth";

export type UserRole = "SEEKER" | "REFERRER" | "ADMIN";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  role: UserRole;
  emailVerified?: Date | null;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    emailVerified?: string | Date | null;
  }
}
