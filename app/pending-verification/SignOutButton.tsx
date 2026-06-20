"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/login" })} 
      className="btn-secondary" 
      style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
    >
      Sign Out & Return to Login
    </button>
  );
}
