"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
}

export function NotificationFeed({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const router = useRouter();

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications", { method: "PUT" });
      toast.success("All notifications marked as read");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (notifications.length === 0) return null;

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
          Recent Notifications
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              background: "none", border: "none", color: "var(--color-primary-light)",
              fontSize: "0.85rem", cursor: "pointer", fontWeight: 600
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {notifications.map((n, i) => (
          <div
            key={n.id}
            onClick={() => { if (!n.isRead) markAsRead(n.id); }}
            style={{
              padding: "1rem 1.25rem",
              borderBottom: i < notifications.length - 1 ? "1px solid var(--glass-border)" : "none",
              background: n.isRead ? "transparent" : "rgba(99,102,241,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            className="hover:bg-white/5"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: n.isRead ? 600 : 700, color: n.isRead ? "var(--color-text-secondary)" : "var(--color-text-primary)" }}>
                {n.title}
              </h4>
              {!n.isRead && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-primary)", flexShrink: 0, marginTop: "0.35rem" }} />}
            </div>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.45 }}>
              {n.message}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {n.link && (
                <Link href={n.link} style={{ fontSize: "0.825rem", color: "var(--color-primary-light)", textDecoration: "none", fontWeight: 600 }}>
                  View Details ↗
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
