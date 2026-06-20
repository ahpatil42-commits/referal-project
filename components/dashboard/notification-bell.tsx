"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications", { method: "PUT" });
      toast.success("All notifications marked as read");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--glass-border)",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.2s ease"
        }}
        className="hover:bg-white/10"
      >
        <span style={{ fontSize: "1.2rem" }}>🔔</span>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "var(--color-primary)",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: 800,
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 10px rgba(99,102,241,0.5)"
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="animate-slide-down"
          style={{
            position: "absolute",
            top: "120%",
            right: 0,
            width: "320px",
            background: "rgba(10, 10, 15, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            zIndex: 1000,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "400px"
          }}
        >
          <div style={{ padding: "1rem", borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--color-text-primary)" }}>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ background: "none", border: "none", color: "var(--color-primary-light)", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>
          
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => { if (!n.isRead) markAsRead(n.id); }}
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid var(--glass-border)",
                    background: n.isRead ? "transparent" : "rgba(99,102,241,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  className="hover:bg-white/5"
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: n.isRead ? 600 : 700, color: n.isRead ? "var(--color-text-secondary)" : "var(--color-text-primary)" }}>
                      {n.title}
                    </h4>
                    {!n.isRead && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-primary)", flexShrink: 0, marginTop: "0.25rem" }} />}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                  {n.link && (
                    <Link href={n.link} onClick={() => setIsOpen(false)} style={{ fontSize: "0.8rem", color: "var(--color-primary-light)", textDecoration: "none", marginTop: "0.25rem", fontWeight: 600 }}>
                      View Details ↗
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
