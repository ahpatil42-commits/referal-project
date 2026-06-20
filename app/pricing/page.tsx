import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <main
      className="bg-space flex-center"
      style={{ minHeight: "100vh", flexDirection: "column", padding: "6rem 2rem", overflowX: "hidden" }}
    >
      <div className="z-content animate-fade-in-up" style={{ textAlign: "center", maxWidth: "900px", marginTop: "2rem" }}>
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
          <span className="text-gradient">serious job seekers.</span>
        </h1>
        <p
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
            color: "var(--color-text-secondary)",
            maxWidth: "600px",
            margin: "0 auto 4rem",
            lineHeight: 1.6,
          }}
        >
          Start landing referrals for free. Upgrade to Pro when you are ready to accelerate your search and stand out.
        </p>
      </div>

      <div className="z-content" style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "1000px" }}>
        
        {/* Free Plan */}
        <div className="glass-panel" style={{ flex: "1", minWidth: "320px", maxWidth: "450px", padding: "3rem", borderTop: "4px solid var(--color-text-muted)" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Starter</h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "2rem" }}>
            <span style={{ fontSize: "3rem", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1 }}>$0</span>
            <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>/forever</span>
          </div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.6 }}>
            Perfect for getting started and exploring the referral network.
          </p>
          <Link href="/register" className="btn-primary" style={{ display: "block", textAlign: "center", textDecoration: "none", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", marginBottom: "2.5rem" }}>
            Get Started
          </Link>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem", color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}><Check size={18} color="var(--color-primary-light)" /> 1 Referral Request per month</li>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}><Check size={18} color="var(--color-primary-light)" /> Basic AI Resume Parsing</li>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}><Check size={18} color="var(--color-primary-light)" /> Standard Support</li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="glass-panel" style={{ flex: "1", minWidth: "320px", maxWidth: "450px", padding: "3rem", borderTop: "4px solid var(--color-primary)", background: "linear-gradient(to bottom, rgba(99,102,241,0.05), transparent)", position: "relative" }}>
          <div style={{ position: "absolute", top: "-1rem", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))", color: "white", padding: "0.25rem 1rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}>MOST POPULAR</div>
          
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>Pro</h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "2rem" }}>
            <span style={{ fontSize: "3rem", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1 }}>$19</span>
            <span style={{ color: "var(--color-text-muted)", fontWeight: 600 }}>/month</span>
          </div>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", marginBottom: "2rem", lineHeight: 1.6 }}>
            Maximize your chances with priority matching and advanced AI tools.
          </p>
          
          <form action="/api/checkout" method="POST" style={{ marginBottom: "2.5rem" }}>
            <button type="submit" className="btn-primary" style={{ width: "100%" }}>
              Upgrade to Pro
            </button>
          </form>

          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem", color: "var(--color-text-secondary)", fontSize: "0.95rem" }}>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}><Check size={18} color="var(--color-primary-light)" /> 10 Referral Requests per month</li>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}><Check size={18} color="var(--color-primary-light)" /> Priority Placement to Referrers</li>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}><Check size={18} color="var(--color-primary-light)" /> Advanced AI Cover Letter Generator</li>
            <li style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}><Check size={18} color="var(--color-primary-light)" /> Profile Analytics (See who viewed)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
