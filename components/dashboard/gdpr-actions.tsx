"use client";

import { useState } from "react";
import { exportUserData, deleteUserAccount } from "@/actions/gdpr";
import { toast } from "sonner";

export function GDPRActions() {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportUserData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "referral-ai-data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Failed to export data.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you absolute sure you want to permanently delete your account? This action cannot be undone.")) return;
    
    try {
      setIsDeleting(true);
      await deleteUserAccount();
    } catch (error) {
      toast.error("Failed to delete account.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "2rem", marginTop: "2rem", border: "1px solid rgba(239, 68, 68, 0.2)", background: "linear-gradient(to bottom right, rgba(239, 68, 68, 0.05), transparent)" }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
        Danger Zone ⚠️
      </h3>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Manage your data or permanently delete your account. This cannot be undone.
      </p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="btn-secondary-hover"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", padding: "0.75rem 1.5rem", borderRadius: "8px", color: "var(--color-text-primary)", cursor: isExporting ? "not-allowed" : "pointer", fontWeight: 600 }}
        >
          {isExporting ? "Exporting..." : "Export My Data (JSON)"}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          style={{ background: "var(--color-error, #ef4444)", border: "none", padding: "0.75rem 1.5rem", borderRadius: "8px", color: "white", cursor: isDeleting ? "not-allowed" : "pointer", fontWeight: 600 }}
        >
          {isDeleting ? "Deleting..." : "Permanently Delete Account"}
        </button>
      </div>
    </div>
  );
}
