"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { ReviewModal } from "./review-modal";

interface ReviewButtonProps {
  referrerId: string;
  referrerName: string;
  hasReviewed: boolean;
}

export function ReviewButton({ referrerId, referrerName, hasReviewed }: ReviewButtonProps) {
  const [showModal, setShowModal] = useState(false);

  if (hasReviewed) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#fbbf24", fontSize: "0.8rem", fontWeight: 600 }}>
        <Star size={14} fill="#fbbf24" /> Reviewed
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          background: "rgba(251, 191, 36, 0.1)",
          border: "1px solid rgba(251, 191, 36, 0.3)",
          color: "#fbbf24",
          padding: "0.4rem 0.75rem",
          borderRadius: "8px",
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
        className="hover:opacity-80"
      >
        <Star size={14} /> Leave Review
      </button>

      {showModal && (
        <ReviewModal
          referrerId={referrerId}
          referrerName={referrerName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
