"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { switchUserRole } from "@/actions/user";
import { toast } from "sonner";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const SEEKER_NAV: NavItem[] = [
  { href: "/dashboard/seeker",          label: "Overview",         icon: "⊞" },
  { href: "/dashboard/seeker/browse",   label: "Browse Referrers", icon: "⊕" },
  { href: "/dashboard/seeker/requests", label: "My Requests",      icon: "◫" },
  { href: "/dashboard/seeker/profile",  label: "My Profile",       icon: "◉" },
  { href: "/dashboard/settings",        label: "Settings",         icon: "⚙️" },
];

const REFERRER_NAV: NavItem[] = [
  { href: "/dashboard/referrer",           label: "Overview",     icon: "⊞" },
  { href: "/dashboard/referrer/requests",  label: "Requests",     icon: "◫" },
  { href: "/dashboard/referrer/referrals", label: "My Referrals", icon: "✓" },
  { href: "/dashboard/referrer/profile",   label: "Manage Roles", icon: "📋" },
  { href: "/dashboard/settings",           label: "Settings",     icon: "⚙️" },
];

interface SidebarProps {
  role: string;
  email: string;
  image?: string | null;
}

export function Sidebar({ role, email, image }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { update } = useSession();
  const [isSwitching, setIsSwitching] = useState(false);

  const navItems = role === "REFERRER" ? REFERRER_NAV : SEEKER_NAV;
  const isReferrer = role === "REFERRER";
  const accentColor = isReferrer ? "var(--color-purple)" : "var(--color-primary)";
  const accentLight = isReferrer ? "#a78bfa" : "var(--color-primary-light)";

  const handleRoleSwitch = async () => {
    setIsSwitching(true);
    const newRole = isReferrer ? "SEEKER" : "REFERRER";
    const toastId = toast.loading(`Switching to ${newRole === "SEEKER" ? "Seeker" : "Referrer"} mode...`);
    
    try {
      // Update DB
      const result = await switchUserRole(newRole);
      
      if (result.error) {
        toast.error(result.error, { id: toastId });
        setIsSwitching(false);
        return;
      }

      // Update NextAuth Session Token
      await update({ role: newRole });
      
      toast.success(`Switched to ${newRole === "SEEKER" ? "Seeker" : "Referrer"} mode`, { id: toastId });
      
      // Redirect using the smart URL from the server action
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
      } else {
        router.push(`/dashboard/${newRole.toLowerCase()}`);
      }
    } catch (error) {
      toast.error("Failed to switch modes.", { id: toastId });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg-elevated)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid var(--glass-border)",
        padding: "1.25rem 0.75rem",
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          textDecoration: "none",
          marginBottom: "1.25rem",
          padding: "0.25rem 0.5rem",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            background: `linear-gradient(135deg, ${accentColor}, var(--color-primary))`,
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            color: "white",
            fontWeight: 900,
            flexShrink: 0,
          }}
        >
          ✦
        </div>
        <span
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--color-text-primary)",
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          ReferralAI
        </span>
      </Link>

      {/* Role Badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${accentColor} 25%, transparent)`,
            color: accentLight,
            padding: "0.3rem 0.625rem",
            borderRadius: "6px",
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          <span style={{ fontSize: "0.65rem" }}>{isReferrer ? "●" : "▲"}</span>
          {role}
        </div>
      </div>

      {/* Section label */}
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          color: "var(--color-text-muted)",
          letterSpacing: "0.1em",
          paddingLeft: "0.5rem",
          marginBottom: "0.375rem",
        }}
      >
        NAVIGATION
      </p>

      {/* Nav items */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.125rem",
          overflow: "hidden",
        }}
      >
        {navItems.map((item) => {
          const basePath = `/dashboard/${role.toLowerCase()}`;
          const isActive =
            item.href === pathname ||
            (item.href !== basePath && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.5rem 0.625rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive
                  ? "var(--color-text-primary)"
                  : "var(--color-text-muted)",
                background: isActive
                  ? `color-mix(in srgb, ${accentColor} 14%, transparent)`
                  : "transparent",
                borderLeft: isActive
                  ? `2px solid ${accentColor}`
                  : "2px solid transparent",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {/* Icon dot — no emoji, just a styled indicator */}
              <span
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "5px",
                  background: isActive
                    ? `color-mix(in srgb, ${accentColor} 30%, transparent)`
                    : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isActive ? `color-mix(in srgb, ${accentColor} 40%, transparent)` : "rgba(255,255,255,0.08)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.55rem",
                  color: isActive ? accentLight : "var(--color-text-muted)",
                  flexShrink: 0,
                  fontWeight: 900,
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + sign out */}
      <div
        style={{
          borderTop: "1px solid var(--glass-border)",
          paddingTop: "0.875rem",
          marginTop: "0.875rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {/* Email */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0 0.25rem",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${accentColor}, var(--color-primary))`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.625rem",
              fontWeight: 700,
              color: "white",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {image ? (
              <img src={image} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              email[0].toUpperCase()
            )}
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {email}
          </span>
        </div>

        <button
          onClick={handleRoleSwitch}
          disabled={isSwitching}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.625rem",
            borderRadius: "8px",
            border: "1px solid var(--glass-border)",
            background: "rgba(255,255,255,0.08)",
            color: "var(--color-text-primary)",
            fontSize: "0.825rem",
            fontWeight: 600,
            cursor: isSwitching ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s ease",
            letterSpacing: "0.01em",
            opacity: isSwitching ? 0.7 : 1,
          }}
        >
          {isSwitching ? "Switching..." : `Switch to ${isReferrer ? "Seeker" : "Referrer"}`}
        </button>

        {/* Share Platform Button */}
        <button
          onClick={async () => {
            const text = "Join ReferralAI and connect directly with verified tech employees for job referrals!";
            if (navigator.share) {
              try { await navigator.share({ title: 'ReferralAI', text, url: window.location.origin }); }
              catch (err) { console.error(err); }
            } else {
              await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
              alert("Platform link copied to clipboard!");
            }
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.625rem",
            borderRadius: "8px",
            border: "1px solid var(--glass-border)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--color-text-primary)",
            fontSize: "0.825rem",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s ease",
          }}
          className="hover:bg-white/10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.25rem" }}>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
          Share Platform
        </button>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.625rem",
            borderRadius: "8px",
            border: "1px solid var(--glass-border)",
            background: "rgba(255,255,255,0.03)",
            color: "var(--color-text-muted)",
            fontSize: "0.825rem",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s ease",
            letterSpacing: "0.01em",
          }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
