"use client";

import { useState, useTransition } from "react";
import { submitReport } from "@/actions/report";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ReportUserModalProps {
  reportedId: string;
  reportedName: string;
  onClose: () => void;
}

export function ReportUserModal({ reportedId, reportedName, onClose }: ReportUserModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleAction = async (formData: FormData) => {
    startTransition(async () => {
      const res = await submitReport(formData);
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", color: "var(--color-error, #ef4444)" }}>
          <AlertTriangle size={24} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Report User
          </h2>
        </div>

        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          You are reporting <strong>{reportedName}</strong>. Please provide a reason so our team can investigate.
        </p>

        <form action={handleAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input type="hidden" name="reportedId" value={reportedId} />
          
          <div>
            <label className="form-label">Reason</label>
            <select name="reason" className="form-input" required defaultValue="" style={{ cursor: "pointer" }}>
              <option value="" disabled>Select a reason...</option>
              <option value="SPAM">Spam or Solicitation</option>
              <option value="HARASSMENT">Harassment or Abuse</option>
              <option value="INAPPROPRIATE">Inappropriate Content</option>
              <option value="FAKE_PROFILE">Fake Profile</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="form-label">Additional Details (Optional)</label>
            <textarea
              name="details"
              className="form-input"
              rows={3}
              placeholder="Provide any additional context to help us investigate..."
              style={{ resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
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
              style={{
                flex: 1,
                background: "var(--color-error, #ef4444)",
                border: "none",
                borderRadius: "var(--radius-md)",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {isPending ? <Loader2 className="animate-spin" size={20} /> : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
