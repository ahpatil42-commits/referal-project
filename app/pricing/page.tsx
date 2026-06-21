import Link from "next/link";
import { Check, Zap, Shield, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <main
      className="bg-space flex-center"
      style={{ minHeight: "100vh", flexDirection: "column", padding: "8rem 2rem 6rem", overflowX: "hidden", position: "relative" }}
    >
      {/* Background Glow */}
      <div 
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60vw",
          height: "60vh",
          background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(0,0,0,0) 60%)",
          filter: "blur(60px)",
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      <div className="z-content animate-fade-in-up" style={{ textAlign: "center", maxWidth: "900px", marginBottom: "4rem" }}>
        <h1
          style={{
            fontSize: "clamp(3rem, 6vw, 4.5rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            marginBottom: "1.5rem",
            letterSpacing: "-0.04em",
          }}
        >
          Simple pricing for <br />
          <span className="text-gradient-purple">serious job seekers.</span>
        </h1>
        <p
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
            color: "var(--color-text-secondary)",
            maxWidth: "650px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Start landing referrals for free. Upgrade to Pro when you are ready to accelerate your search and stand out.
        </p>
      </div>

      <div className="z-content" style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "1050px" }}>
        
        {/* Starter Plan */}
        <div className="glass-panel dashboard-card" style={{ flex: "1", minWidth: "320px", maxWidth: "480px", padding: "3rem", borderTop: "4px solid var(--color-text-muted)" }}>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield className="text-text-muted" size={24} color="var(--color-text-muted)" />
            Starter
          </h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "2.5rem" }}>
            <span style={{ fontSize: "3.5rem", fontWeight: 900, color: "var(--color-text-primary)", lineHeight: 1 }}>$0</span>
            <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>/forever</span>
          </div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: 1.6 }}>
            Perfect for getting started and exploring the referral network.
          </p>
          <Link href="/register" className="btn-secondary-hover" style={{ display: "block", textAlign: "center", textDecoration: "none", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", marginBottom: "2.5rem", padding: "1rem", borderRadius: "var(--radius-md)", color: "var(--color-text-primary)", fontWeight: 600, transition: "background 0.2s ease" }}>
            Get Started Free
          </Link>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem", color: "var(--color-text-secondary)", fontSize: "1rem" }}>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}><Check size={20} color="var(--color-text-muted)" /> 1 Referral Request per month</li>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}><Check size={20} color="var(--color-text-muted)" /> Basic AI Resume Parsing</li>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}><Check size={20} color="var(--color-text-muted)" /> Standard Support</li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="glass-panel dashboard-card" style={{ flex: "1", minWidth: "320px", maxWidth: "480px", padding: "3rem", borderTop: "4px solid var(--color-primary)", background: "linear-gradient(to bottom, rgba(99,102,241,0.08), transparent)", position: "relative", boxShadow: "0 20px 40px rgba(99,102,241,0.15)", overflow: "visible" }}>
          <div style={{ position: "absolute", top: "-1rem", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))", color: "white", padding: "0.4rem 1.25rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", boxShadow: "0 4px 12px rgba(99,102,241,0.4)", display: "flex", alignItems: "center", gap: "0.5rem", zIndex: 10 }}>
            <Sparkles size={14} /> MOST POPULAR
          </div>
          
          <h3 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap color="var(--color-primary)" size={24} />
            Pro
          </h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "2.5rem" }}>
            <span style={{ fontSize: "3.5rem", fontWeight: 900, color: "var(--color-text-primary)", lineHeight: 1 }}>$19</span>
            <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>/month</span>
          </div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem", marginBottom: "2.5rem", lineHeight: 1.6 }}>
            Maximize your chances with priority matching and advanced AI tools.
          </p>
          
          <form action="/api/checkout" method="POST" style={{ marginBottom: "2.5rem" }}>
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "1.1rem", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              Upgrade to Pro <Zap size={18} />
            </button>
          </form>

          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem", color: "var(--color-text-secondary)", fontSize: "1rem" }}>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}><Check size={20} color="var(--color-primary-light)" /> <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>10 Referral Requests per month</span></li>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}><Check size={20} color="var(--color-primary-light)" /> Priority Placement to Referrers</li>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}><Check size={20} color="var(--color-primary-light)" /> Advanced AI Cover Letter Generator</li>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}><Check size={20} color="var(--color-primary-light)" /> Profile Analytics (See who viewed)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
