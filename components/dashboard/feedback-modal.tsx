"use client";

import { useState } from "react";
import { submitFeedback } from "@/actions/feedback";
import { toast } from "sonner";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<"BUG" | "FEATURE_REQUEST" | "GENERAL">("GENERAL");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    setIsSubmitting(true);
    const res = await submitFeedback({ type, message });
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success);
      setMessage("");
      setType("GENERAL");
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <div 
      className="animate-fade-in"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div 
        className="glass-panel animate-fade-in-up"
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "2rem",
          position: "relative"
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            fontSize: "1.2rem"
          }}
        >
          ✕
        </button>

        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
          Send Feedback
        </h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          We'd love to hear your thoughts, feature requests, or bug reports to help us improve ReferralAI!
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label className="form-label">Feedback Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as any)}
              className="form-input"
            >
              <option value="GENERAL" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-primary)" }}>General Feedback</option>
              <option value="FEATURE_REQUEST" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-primary)" }}>Feature Request</option>
              <option value="BUG" style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-primary)" }}>Report a Bug</option>
            </select>
          </div>

          <div>
            <label className="form-label">Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="form-input"
              rows={5}
              placeholder="Tell us what's on your mind..."
              style={{ resize: "vertical", minHeight: "100px" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "0.5rem" }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
