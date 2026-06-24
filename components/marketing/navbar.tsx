"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 50,
      background: "rgba(10, 10, 20, 0.8)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)"
    }}>
      <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--color-primary-light)" }}>
        ReferralAI
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6">
        <Link href="/pricing" className="text-link" style={{ fontSize: "0.95rem", fontWeight: 600 }}>Pricing</Link>
      </div>

      {/* Mobile Hamburger Icon */}
      <button 
        className="md:hidden" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "rgba(10, 10, 20, 0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          alignItems: "center"
        }}>
          <Link href="/pricing" onClick={() => setIsOpen(false)} style={{ fontSize: "1.1rem", fontWeight: 600, color: "white", textDecoration: "none" }}>Pricing</Link>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <Link 
              href="/login"
              className="btn-secondary-hover"
              style={{ padding: "0.5rem 1rem", borderRadius: "99px", textDecoration: "none", color: "var(--color-text-primary)", fontWeight: 500, border: "1px solid var(--glass-border)" }}
            >
              Sign In
            </Link>
            <ThemeToggle />
            <Link href="/register" style={{ padding: "0.5rem 1.5rem", borderRadius: "99px", background: "var(--color-primary)", color: "white", textDecoration: "none" }}>Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
