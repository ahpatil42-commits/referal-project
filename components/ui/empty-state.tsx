import Link from "next/link";
import React from "react";

interface EmptyStateProps {
  icon: string | React.ReactNode;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({ icon, title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: "4rem 2rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(0,0,0,0) 70%)",
          zIndex: 0,
        }}
      />
      
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "1.25rem", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>
          {icon}
        </div>
        <h3 style={{ color: "var(--color-text-primary)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          {title}
        </h3>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
          {description}
        </p>
        
        {actionHref && actionLabel && (
          <Link href={actionHref} className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
