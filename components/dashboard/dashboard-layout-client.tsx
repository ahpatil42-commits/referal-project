"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { usePathname } from "next/navigation";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function DashboardLayoutClient({ children, sidebar }: DashboardLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="bg-space dashboard-layout" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile Top Navigation */}
      <div className="mobile-top-nav">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{ 
              background: "none", 
              border: "none", 
              color: "var(--color-text-primary)", 
              fontSize: "1.5rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.25rem"
            }}
          >
            ☰
          </button>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <div style={{
              width: "24px", height: "24px",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-purple))",
              borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", color: "white", fontWeight: 900
            }}>✦</div>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
              ReferralAI
            </span>
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`} 
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Wrapper */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? "open" : ""}`}>
        {sidebar}
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", width: "100%" }}>
        {/* Main Content */}
        <main
          className="z-content main-content"
          style={{
            flex: 1,
            padding: "2rem",
            overflowX: "hidden",
            overflowY: "auto",
            minWidth: 0,
            maxWidth: "1100px",
            margin: "0 auto",
            position: "relative"
          }}
        >
          {/* Desktop Header */}
          <div 
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}
            className="hidden-on-mobile"
          >
            <Breadcrumbs />
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
          
          {children}
        </main>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .hidden-on-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
