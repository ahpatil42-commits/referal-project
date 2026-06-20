type StatusType = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";

const CONFIG: Record<StatusType, { label: string; color: string; bg: string; border: string }> = {
  PENDING:   { label: "Pending",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)"   },
  ACCEPTED:  { label: "Accepted",  color: "#10b981", bg: "rgba(16,185,129,0.1)",   border: "rgba(16,185,129,0.25)"   },
  REJECTED:  { label: "Rejected",  color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.25)"    },
  COMPLETED: { label: "Completed", color: "#6366f1", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.25)"   },
};

const EMOJI: Record<StatusType, string> = {
  PENDING:   "🕐",
  ACCEPTED:  "✅",
  REJECTED:  "❌",
  COMPLETED: "🎉",
};

export function StatusBadge({ status }: { status: string }) {
  const s = (status as StatusType) in CONFIG ? (status as StatusType) : "PENDING";
  const c = CONFIG[s];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        padding: "0.25rem 0.65rem",
        borderRadius: "9999px",
        fontSize: "0.775rem",
        fontWeight: 600,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: "0.7rem" }}>{EMOJI[s]}</span>
      {c.label.toUpperCase()}
    </span>
  );
}
