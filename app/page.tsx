import Link from "next/link";
import { db } from "@/lib/db";

export default async function HomePage() {
  const [totalSeekers, totalReferrers, totalRequests] = await Promise.all([
    db.user.count({ where: { role: "SEEKER" } }),
    db.user.count({ where: { role: "REFERRER" } }),
    db.referralRequest.count({ where: { status: "ACCEPTED" } })
  ]);

  return (
    <main
      className="bg-space flex-center"
      style={{ minHeight: "100vh", flexDirection: "column", gap: "4rem", padding: "4rem 2rem", overflowX: "hidden" }}
    >
      {/* Hero Section */}
      <div className="z-content animate-fade-in-up" style={{ textAlign: "center", maxWidth: "800px", marginTop: "2rem" }}>
        <div className="logo-badge" style={{ justifyContent: "center", marginBottom: "1.5rem", display: "inline-flex" }}>
          <div className="logo-icon">✦</div>
          <span>ReferralAI is now in open beta</span>
        </div>
        <h1
          style={{
            fontSize: "clamp(3rem, 7vw, 5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "1.25rem",
            letterSpacing: "-0.03em",
          }}
        >
          Your Referral Network,{" "}
          <span className="text-gradient">Supercharged by AI</span>
        </h1>
        <p
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
            color: "var(--color-text-secondary)",
            maxWidth: "600px",
            margin: "0 auto 2.5rem",
            lineHeight: 1.6,
          }}
        >
          Stop throwing resumes into the void. Connect directly with verified professionals who can refer you to top tech companies.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/register"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)",
              color: "white",
              fontWeight: 600,
              padding: "0.875rem 2.5rem",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              fontSize: "1.1rem",
              boxShadow: "0 0 20px rgba(99,102,241,0.4)",
              transition: "all 0.2s ease",
            }}
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.05)",
              color: "var(--color-text-primary)",
              fontWeight: 600,
              padding: "0.875rem 2.5rem",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              fontSize: "1.1rem",
              border: "1px solid var(--glass-border)",
              transition: "all 0.2s ease",
            }}
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Live Stats Section */}
      <div 
        className="z-content animate-slide-up"
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "1.5rem",
          width: "100%",
          maxWidth: "1000px",
          marginTop: "2rem",
          animationDelay: "0.2s"
        }}
      >
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", borderTop: "3px solid var(--color-accent)" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
            {totalSeekers.toLocaleString()}
          </div>
          <div style={{ color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.875rem" }}>
            Ambitious Seekers
          </div>
        </div>
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", borderTop: "3px solid var(--color-primary-light)" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
            {totalReferrers.toLocaleString()}
          </div>
          <div style={{ color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.875rem" }}>
            Verified Referrers
          </div>
        </div>
        <div className="glass-panel" style={{ padding: "2rem", textAlign: "center", borderTop: "3px solid var(--color-success)" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
            {totalRequests.toLocaleString()}
          </div>
          <div style={{ color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.875rem" }}>
            Successful Referrals
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="z-content" style={{ width: "100%", maxWidth: "1200px", marginTop: "4rem" }}>
        <h2 style={{ textAlign: "center", fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
          How it Works
        </h2>
        <p style={{ textAlign: "center", color: "var(--color-text-secondary)", fontSize: "1.1rem", marginBottom: "4rem", maxWidth: "600px", margin: "0 auto 4rem" }}>
          Our platform is designed to effortlessly bridge the gap between ambitious job seekers and verified tech employees.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "3rem" }}>
          
          {/* SEEKER PATH */}
          <div className="glass-panel" style={{ padding: "3rem 2.5rem", position: "relative", overflow: "hidden", borderTop: "4px solid var(--color-primary)" }}>
            <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", padding: "0.5rem 1rem", background: "rgba(99,102,241,0.1)", color: "var(--color-primary-light)", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em" }}>FOR SEEKERS</div>
            <h3 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "2rem", color: "var(--color-text-primary)" }}>Land your dream role</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>1</div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.3rem" }}>Upload & Auto-fill</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Upload your resume (PDF, DOCX, or TXT). Our AI instantly extracts your skills and crafts a compelling bio.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>2</div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.3rem" }}>Find Your Match</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Browse verified referrers from top tech companies. Our AI scoring engine shows you your exact match percentage.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>3</div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.3rem" }}>Connect in Real-Time</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Send a request pitch. Once accepted, jump into a real-time chat to coordinate your referral application.</p>
                </div>
              </div>
            </div>
          </div>

          {/* REFERRER PATH */}
          <div className="glass-panel" style={{ padding: "3rem 2.5rem", position: "relative", overflow: "hidden", borderTop: "4px solid var(--color-accent)" }}>
            <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", padding: "0.5rem 1rem", background: "rgba(236,72,153,0.1)", color: "var(--color-accent)", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em" }}>FOR REFERRERS</div>
            <h3 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "2rem", color: "var(--color-text-primary)" }}>Find top talent</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>1</div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.3rem" }}>Verify Your Status</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Sign up with your corporate email to get verified. Set your maximum monthly referral limit to control your inbox.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>2</div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.3rem" }}>Review Requests</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Receive highly targeted pitches from candidates whose skills strongly match your open roles.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>3</div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.3rem" }}>Refer & Earn</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Accept the best candidates, submit them to your internal portal, and collect your company's referral bonuses.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
