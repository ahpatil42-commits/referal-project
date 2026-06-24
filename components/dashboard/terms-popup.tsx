"use client";

import { useState, useTransition } from "react";
import { acceptTermsOfService } from "@/actions/user";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function TermsPopup() {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleAccept = () => {
    startTransition(async () => {
      const res = await acceptTermsOfService();
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Terms accepted successfully.");
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        className="glass-panel animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
            Terms & Conditions Update
          </h2>
          <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
            To continue using ReferralAI, you must read and accept our updated Terms of Service and Privacy Policy.
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
          <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li>You agree to use this platform only for lawful professional networking.</li>
            <li>You understand that your profile data may be shared with referrers or seekers during the request process.</li>
            <li>We do not guarantee job placements or successful referrals.</li>
          </ul>
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", textAlign: "center" }}>
          Read the full <Link href="/terms" target="_blank" className="text-link">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="text-link">Privacy Policy</Link>.
        </div>

        <button
          onClick={handleAccept}
          disabled={isPending}
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : "I Accept the Terms"}
        </button>
      </div>
    </div>
  );
}
