"use client";

import { useState, useTransition } from "react";
import { RequestModal } from "@/components/dashboard/request-modal";
import { ReportUserModal } from "@/components/dashboard/report-modal";
import { getMatchExplanation } from "@/actions/ai";
import { toast } from "sonner";

interface ReferrerCardProps {
  referrer: {
    id: string;
    userId: string;
    company: string | null;
    jobTitle: string | null;
    bio: string | null;
    yearsAtCompany: number | null;
    maxReferrals: number;
    isVerified: boolean;
    linkedinUrl: string | null;
    user: { email: string; name: string | null };
    referralPostings?: { id: string; jobTitle: string; company: string; jobUrl: string | null; experience: string | null; skills: string | null; location: string | null }[];
  };
  matchScore?: number;
}

export function ReferrerCard({ referrer, matchScore }: ReferrerCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, startTransition] = useTransition();

  const handleExplainMatch = () => {
    startTransition(async () => {
      const res = await getMatchExplanation(referrer.id);
      if (res.error) toast.error(res.error);
      if (res.success) setExplanation(res.success);
    });
  };

  const displayName = referrer.user.name || referrer.user.email.split("@")[0];

  const handleShare = async () => {
    const text = `Check out ${displayName} (${referrer.jobTitle} at ${referrer.company}) on ReferralAI! Get a referral for your next job.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ReferralAI',
          text: text,
          url: window.location.origin,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <>
      <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-purple) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
            }}
          >
            {displayName[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <p style={{ fontWeight: 700, color: "var(--color-text-primary)", fontSize: "0.975rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                {displayName}
                {referrer.isVerified && (
                  <span title="Verified Corporate Email" style={{ color: "#3b82f6", display: "inline-flex", alignItems: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/>
                    </svg>
                  </span>
                )}
              </p>
              <button 
                onClick={() => setShowReport(true)}
                style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", opacity: 0.5, transition: "opacity 0.2s" }}
                className="hover:opacity-100"
                title="Report User"
              >
                🚩
              </button>
            </div>
            {referrer.jobTitle && referrer.company && (
              <p style={{ fontSize: "0.825rem", color: "var(--color-text-secondary)", marginTop: "0.1rem" }}>
                {referrer.jobTitle} @ <strong>{referrer.company}</strong>
              </p>
            )}
          </div>
          {/* Match Score Badge */}
          {matchScore !== undefined && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(167, 139, 250, 0.1)",
                border: "1px solid rgba(167, 139, 250, 0.2)",
                borderRadius: "8px",
                padding: "0.3rem 0.6rem",
              }}
            >
              <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--color-purple)", letterSpacing: "0.05em", marginBottom: "0.1rem" }}>AI MATCH</span>
              <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
                {matchScore}%
              </span>
            </div>
          )}
        </div>

        {/* Bio */}
        {referrer.bio && (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {referrer.bio}
          </p>
        )}

        {/* Meta chips */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {referrer.yearsAtCompany != null && (
            <span
              style={{
                fontSize: "0.75rem",
                padding: "0.2rem 0.6rem",
                borderRadius: "9999px",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                color: "var(--color-primary-light)",
              }}
            >
              {referrer.yearsAtCompany}y at company
            </span>
          )}
          <span
            style={{
              fontSize: "0.75rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#6ee7b7",
            }}
          >
            Up to {referrer.maxReferrals} referrals
          </span>
        </div>

        {/* Roles Hiring For */}
        {referrer.referralPostings && referrer.referralPostings.length > 0 && (
          <div style={{ marginTop: "0.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Currently Referring For:</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {referrer.referralPostings.map(posting => (
                <div key={posting.id} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <a
                      href={posting.jobUrl || "#"}
                      target={posting.jobUrl ? "_blank" : undefined}
                      rel={posting.jobUrl ? "noopener noreferrer" : undefined}
                      style={{
                        fontSize: "0.8rem",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "6px",
                        background: "rgba(167, 139, 250, 0.15)",
                        border: "1px solid rgba(167, 139, 250, 0.3)",
                        color: "var(--color-purple)",
                        textDecoration: "none",
                        display: "inline-block",
                        fontWeight: 500,
                      }}
                      title={posting.jobUrl ? "View Job Description" : ""}
                    >
                      {posting.jobTitle} {posting.jobUrl && "↗"}
                    </a>
                  </div>
                  {(posting.location || posting.experience || posting.skills) && (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", paddingLeft: "0.25rem", marginTop: "0.25rem" }}>
                      {posting.location && (
                        <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>📍 {posting.location}</span>
                      )}
                      {posting.experience && (
                        <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>⏱ {posting.experience}</span>
                      )}
                      {posting.skills && (
                        <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>⚡ {posting.skills}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Explanation Area */}
        {(matchScore !== undefined && matchScore >= 0) && (
          <div style={{ marginTop: "0.25rem" }}>
            {!explanation ? (
              <button
                onClick={handleExplainMatch}
                disabled={isExplaining}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-purple)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                {isExplaining ? "Analyzing..." : "Why am I a match? ✨"}
              </button>
            ) : (
              <div
                className="animate-fade-in-up"
                style={{
                  background: "rgba(167, 139, 250, 0.05)",
                  border: "1px solid rgba(167, 139, 250, 0.2)",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.85rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--color-purple)", marginRight: "0.3rem" }}>✨ AI Insight:</span>
                {explanation}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
            style={{ flex: 1 }}
          >
            Request Referral 🚀
          </button>
          <button
            onClick={handleShare}
            style={{
              padding: "0 1rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-primary)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            className="hover:bg-white/10"
            title="Share Profile"
          >
            <span style={{ fontSize: "1.1rem" }}>↗️</span>
          </button>
        </div>
      </div>

      {showModal && (
        <RequestModal
          referrerId={referrer.id}
          referrerName={displayName}
          referrerCompany={referrer.company || referrer.referralPostings?.[0]?.company || ""}
          onClose={() => setShowModal(false)}
        />
      )}

      {showReport && (
        <ReportUserModal
          reportedId={referrer.userId}
          reportedName={displayName}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}
