"use client";

import { useTransition, useState } from "react";
import { updateRequestStatus } from "@/actions/referrer";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ChatButton } from "@/components/dashboard/chat-button";
import { toast } from "sonner";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
}

interface Request {
  id: string;
  jobTitle: string;
  company: string;
  jobUrl: string | null;
  coverNote: string;
  status: string;
  createdAt: Date;
  seeker: {
    headline: string | null;
    linkedinUrl: string | null;
    skills: any;
    resumeStoragePath: string | null;
    user: { email: string; name: string | null; profileNumber: string | null };
  };
  messages: Message[];
  matchScore?: number;
}

interface RequestsClientProps {
  requests: Request[];
  currentUserId: string;
}

function RequestCard({ req, onUpdate, currentUserId }: { req: Request; onUpdate: (id: string, newStatus: string) => void, currentUserId: string }) {
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState(req.status);

  const seekerName = req.seeker.user.name || req.seeker.user.email.split("@")[0];
  const skills: string[] = Array.isArray(req.seeker.skills) ? req.seeker.skills : [];

  const handleAction = (status: "ACCEPTED" | "REJECTED" | "IGNORED") => {
    startTransition(async () => {
      const res = await updateRequestStatus({ requestId: req.id, status, referrerNote: note });
      if (res.error) toast.error(res.error);
      if (res.success) {
        toast.success(res.success);
        setLocalStatus(status);
        onUpdate(req.id, status);
      }
    });
  };

  return (
    <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div
              style={{
                width: "38px", height: "38px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem", fontWeight: 700, color: "white", flexShrink: 0,
              }}
            >
              {seekerName[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: "var(--color-text-primary)", fontSize: "0.95rem" }}>{seekerName}</p>
              {req.seeker.user.profileNumber && (
                <p style={{ fontSize: "0.75rem", color: "var(--color-primary-light)", fontWeight: 700, marginTop: "0.15rem" }}>
                  ID: {req.seeker.user.profileNumber}
                </p>
              )}
              {req.seeker.headline && (
                <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{req.seeker.headline}</p>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {req.matchScore !== undefined && (
            <span style={{ 
              background: req.matchScore >= 80 ? "rgba(16,185,129,0.1)" : req.matchScore >= 50 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)", 
              color: req.matchScore >= 80 ? "#10b981" : req.matchScore >= 50 ? "#f59e0b" : "#ef4444", 
              padding: "0.25rem 0.6rem", 
              borderRadius: "9999px", 
              fontSize: "0.75rem", 
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.25rem"
            }}>
              ✨ {req.matchScore}% Match
            </span>
          )}
          <StatusBadge status={localStatus} />
          {localStatus === "ACCEPTED" && (
            <ChatButton
              requestId={req.id}
              currentUserId={currentUserId}
              messages={req.messages || []}
              otherUserName={seekerName}
            />
          )}
        </div>
      </div>

      {/* Job info */}
      <div
        style={{
          background: "rgba(99,102,241,0.07)",
          border: "1px solid rgba(99,102,241,0.15)",
          borderRadius: "var(--radius-md)",
          padding: "0.75rem 1rem",
        }}
      >
        <p style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "0.9rem" }}>
          {req.jobTitle} <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>@</span> {req.company}
        </p>
        {req.jobUrl && (
          <a href={req.jobUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "0.8rem", color: "var(--color-primary-light)", marginTop: "0.2rem", display: "inline-block" }}>
            View Job Posting ↗
          </a>
        )}
      </div>

      {/* Skills chips */}
      {skills.length > 0 && (
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {skills.slice(0, 6).map((s) => (
            <span key={s} style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem", borderRadius: "9999px", background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.15)", color: "var(--color-accent)" }}>
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Cover note toggle */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ background: "none", border: "none", color: "var(--color-primary-light)", cursor: "pointer", fontSize: "0.85rem", padding: 0, fontFamily: "inherit" }}
        >
          {expanded ? "▲ Hide" : "▼ Read"} cover note
        </button>
        {expanded && (
          <div className="animate-slide-down"
            style={{ marginTop: "0.5rem", padding: "0.875rem", borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
            {req.coverNote}
          </div>
        )}
      </div>

      {/* Action buttons (only for PENDING) */}
      {localStatus === "PENDING" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="form-input"
            rows={2}
            placeholder="Optional: add a note (visible to the seeker)"
            style={{ resize: "vertical", fontSize: "0.85rem" }}
          />
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={() => handleAction("IGNORED")}
              disabled={isPending}
              style={{
                flex: 1, padding: "0.65rem", borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                color: "var(--color-text-secondary)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem",
                fontWeight: 600, transition: "all 0.15s ease",
              }}
            >
              ⊘ Ignore
            </button>
            <button
              onClick={() => handleAction("REJECTED")}
              disabled={isPending}
              style={{
                flex: 1, padding: "0.65rem", borderRadius: "var(--radius-md)",
                border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
                color: "#fca5a5", cursor: "pointer", fontFamily: "inherit", fontSize: "0.875rem",
                fontWeight: 600, transition: "all 0.15s ease",
              }}
            >
              ✕ Decline
            </button>
            <button
              onClick={() => handleAction("ACCEPTED")}
              disabled={isPending}
              style={{
                flex: 2, padding: "0.65rem", borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--color-success), #059669)",
                border: "none", color: "white", cursor: "pointer", fontFamily: "inherit",
                fontSize: "0.875rem", fontWeight: 600, transition: "all 0.15s ease",
              }}
            >
              {isPending ? "..." : "✓ Accept & Refer"}
            </button>
          </div>
        </div>
      )}

      {/* Links */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {req.seeker.linkedinUrl && (
          <a href={req.seeker.linkedinUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", textDecoration: "none" }}>
            🔗 LinkedIn Profile
          </a>
        )}
        {req.seeker.resumeStoragePath && (
          <>
            <a href={req.seeker.resumeStoragePath} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "0.8rem", color: "var(--color-primary-light)", textDecoration: "none" }}>
              📄 View Resume
            </a>
            <a href={req.seeker.resumeStoragePath} download
              style={{ fontSize: "0.8rem", color: "var(--color-accent)", textDecoration: "none" }}>
              ⬇️ Download Resume
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export function ReferrerRequestsClient({ requests: initialRequests, currentUserId }: RequestsClientProps) {
  const [requests, setRequests] = useState(initialRequests);
  const pending = requests.filter((r) => r.status === "PENDING");
  const reviewed = requests.filter((r) => r.status !== "PENDING" && r.status !== "IGNORED");

  const handleUpdate = (id: string, newStatus: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {pending.length > 0 && (
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: "1rem", letterSpacing: "0.05em" }}>
            AWAITING REVIEW ({pending.length})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
            {pending.map((req) => <RequestCard key={req.id} req={req} onUpdate={handleUpdate} currentUserId={currentUserId} />)}
          </div>
        </section>
      )}

      {reviewed.length > 0 && (
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: "1rem", letterSpacing: "0.05em" }}>
            REVIEWED ({reviewed.length})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
            {reviewed.map((req) => <RequestCard key={req.id} req={req} onUpdate={handleUpdate} currentUserId={currentUserId} />)}
          </div>
        </section>
      )}
    </div>
  );
}
