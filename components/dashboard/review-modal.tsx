"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/actions/review";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";

interface ReviewModalProps {
  referrerId: string;
  referrerName: string;
  onClose: () => void;
}

export function ReviewModal({ referrerId, referrerName, onClose }: ReviewModalProps) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleAction = async (formData: FormData) => {
    formData.append("rating", rating.toString());
    
    startTransition(async () => {
      const res = await submitReview(formData);
      if (res.error) toast.error(res.error);
      if (res.success) {
        toast.success(res.success);
        onClose();
      }
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        className="glass-panel animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "500px", padding: "2rem", display: "flex", flexDirection: "column" }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Leave a Review
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            How was your experience with <strong>{referrerName}</strong>?
          </p>
        </div>

        <form action={handleAction} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <input type="hidden" name="referrerId" value={referrerId} />
          
          <div>
            <label className="form-label" style={{ marginBottom: "0.5rem" }}>Rating</label>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.25rem",
                    color: star <= (hoveredRating || rating) ? "#fbbf24" : "rgba(255,255,255,0.2)",
                    transition: "color 0.2s"
                  }}
                >
                  <Star size={32} fill={star <= (hoveredRating || rating) ? "#fbbf24" : "transparent"} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Comment (Optional)</label>
            <textarea
              name="comment"
              className="form-input"
              rows={4}
              placeholder="Share details of your own experience at this place..."
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn-secondary-hover"
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--glass-border)",
                background: "var(--glass-bg)",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {isPending ? <Loader2 className="animate-spin" size={20} /> : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
