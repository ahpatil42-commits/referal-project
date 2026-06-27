"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="btn-secondary"
      style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}
    >
      Sign Out &amp; Return to Login
    </button>
  );
}
