"use client";

import { useState, useTransition } from "react";
import { toggleUserSuspension } from "@/actions/admin";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isSuspended: boolean;
  isAdmin: boolean;
  createdAt: Date;
};

export function AdminClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = (userId: string, currentSuspended: boolean) => {
    setLoadingId(userId);
    startTransition(async () => {
      const res = await toggleUserSuspension(userId, !currentSuspended);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(currentSuspended ? "User unsuspended." : "User suspended.");
        setUsers((prev) => 
          prev.map((u) => u.id === userId ? { ...u, isSuspended: !currentSuspended } : u)
        );
      }
      setLoadingId(null);
    });
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
            <th style={{ padding: "1rem", color: "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem", textAlign: "left" }}>Name</th>
            <th style={{ padding: "1rem", color: "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem", textAlign: "left" }}>Role</th>
            <th style={{ padding: "1rem", color: "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem", textAlign: "left" }}>Joined</th>
            <th style={{ padding: "1rem", color: "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem", textAlign: "left" }}>Status</th>
            <th style={{ padding: "1rem", color: "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
              <td style={{ padding: "1rem" }}>
                <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{u.name || "Unnamed"}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{u.email}</div>
              </td>
              <td style={{ padding: "1rem" }}>
                <span style={{
                  fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "99px",
                  background: u.isAdmin ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                  color: u.isAdmin ? "var(--color-primary-light)" : "var(--color-text-muted)",
                  letterSpacing: "0.05em"
                }}>
                  {u.isAdmin ? "ADMIN" : u.role}
                </span>
              </td>
              <td style={{ padding: "1rem", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: "1rem" }}>
                {u.isSuspended ? (
                  <span style={{ color: "#fca5a5", fontSize: "0.875rem", fontWeight: 600 }}>Suspended</span>
                ) : (
                  <span style={{ color: "var(--color-success)", fontSize: "0.875rem", fontWeight: 600 }}>Active</span>
                )}
              </td>
              <td style={{ padding: "1rem", textAlign: "right" }}>
                {!u.isAdmin && (
                  <button
                    onClick={() => handleToggle(u.id, u.isSuspended)}
                    disabled={isPending && loadingId === u.id}
                    style={{
                      padding: "0.4rem 0.75rem",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: u.isSuspended ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.15)",
                      color: u.isSuspended ? "var(--color-text-primary)" : "#fca5a5",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {isPending && loadingId === u.id 
                      ? "..." 
                      : u.isSuspended ? "Unsuspend" : "Suspend"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
