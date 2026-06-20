"use client";

import { useState } from "react";
import { PostingModal } from "./posting-modal";
import { togglePostingStatus, deletePosting } from "@/actions/posting";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type ReferralPosting = {
  id: string;
  jobTitle: string;
  company: string;
  jobUrl: string | null;
  description: string | null;
  isActive: boolean;
};

export function ReferrerPostingsList({ postings, defaultCompany }: { postings: ReferralPosting[], defaultCompany: string }) {
  const [showModal, setShowModal] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    const res = await togglePostingStatus(id, !currentStatus);
    if (res.error) toast.error(res.error);
    if (res.success) toast.success(res.success);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    setLoadingId(id);
    const res = await deletePosting(id);
    if (res.error) toast.error(res.error);
    if (res.success) toast.success(res.success);
    setLoadingId(null);
  };

  return (
    <div style={{ marginTop: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Roles I'm Referring For 📋
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Add specific roles you are willing to refer candidates for. Seekers can apply directly to these.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
        >
          + Add Role
        </button>
      </div>

      {postings.length === 0 ? (
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", borderStyle: "dashed" }}>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>You haven't posted any specific roles yet.</p>
          <button onClick={() => setShowModal(true)} style={{ background: "none", border: "none", color: "var(--color-purple)", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
            Create your first referral posting
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {postings.map(posting => (
            <div key={posting.id} className="glass-panel" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {posting.jobTitle}
                  {!posting.isActive && <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", background: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "var(--color-text-muted)" }}>Inactive</span>}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>{posting.company}</p>
                {posting.jobUrl && (
                  <a href={posting.jobUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8rem", color: "var(--color-primary-light)", textDecoration: "underline", display: "inline-block", marginTop: "0.5rem" }}>
                    View JD →
                  </a>
                )}
                {posting.description && (
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.75rem", lineHeight: 1.5, background: "rgba(0,0,0,0.2)", padding: "0.75rem", borderRadius: "8px" }}>
                    {posting.description}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => handleToggle(posting.id, posting.isActive)}
                  disabled={loadingId === posting.id}
                  style={{ padding: "0.5rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "6px", color: posting.isActive ? "var(--color-warning)" : "var(--color-success)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
                >
                  {loadingId === posting.id ? <Loader2 size={14} className="animate-spin" /> : (posting.isActive ? "Pause" : "Activate")}
                </button>
                <button
                  onClick={() => handleDelete(posting.id)}
                  disabled={loadingId === posting.id}
                  style={{ padding: "0.5rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "6px", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <PostingModal onClose={() => setShowModal(false)} defaultCompany={defaultCompany} />}
    </div>
  );
}
