"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className: "glass-panel",
        style: {
          background: "var(--color-surface)",
          border: "1px solid var(--glass-border)",
          color: "var(--color-text-primary)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        },
        classNames: {
          toast: "glass-panel",
          title: "text-foreground font-semibold",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
          error: "bg-red-500/10 border-red-500/20 text-red-400",
          success: "bg-green-500/10 border-green-500/20 text-green-400",
        },
      }}
    />
  );
}
