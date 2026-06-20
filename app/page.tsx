import Link from "next/link";
import { db } from "@/lib/db";
import { Sparkles, Users, Briefcase, CheckCircle2, ArrowRight, Zap, Target, MessageSquare } from "lucide-react";

export default async function HomePage() {
  const [totalSeekers, totalReferrers, totalRequests] = await Promise.all([
    db.user.count({ where: { role: "SEEKER" } }),
    db.user.count({ where: { role: "REFERRER" } }),
    db.referralRequest.count({ where: { status: "ACCEPTED" } })
  ]);

  return (
    <main
      className="bg-space flex-center"
      style={{ minHeight: "100vh", flexDirection: "column", padding: "6rem 2rem", overflowX: "hidden" }}
    >
      {/* Background Glowing Orb */}
      <div 
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60vw",
          height: "60vh",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(60px)",
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      {/* Hero Section */}
      <div className="z-content animate-fade-in-up" style={{ textAlign: "center", maxWidth: "900px", marginTop: "2rem" }}>
        <div 
          className="logo-badge" 
          style={{ 
            justifyContent: "center", 
            marginBottom: "2rem", 
            display: "inline-flex",
            background: "rgba(255,255,255,0.03)",
            padding: "0.5rem 1.5rem",
            borderRadius: "99px",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)"
          }}
        >
          <div className="logo-icon" style={{ width: "24px", height: "24px", fontSize: "0.8rem", marginRight: "0.5rem" }}>✦</div>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.05em", color: "var(--color-primary-light)" }}>REFERRAL AI IS NOW IN OPEN BETA</span>
        </div>
        
        <h1
          style={{
            fontSize: "clamp(3.5rem, 8vw, 6rem)",
            fontWeight: 900,
            lineHeight: 1.05,
            marginBottom: "1.5rem",
            letterSpacing: "-0.04em",
          }}
        >
          Your Referral Network,<br />
          <span className="text-gradient-purple">Supercharged by AI</span>
        </h1>
        
        <p
          style={{
            fontSize: "clamp(1.15rem, 2.5vw, 1.35rem)",
            color: "var(--color-text-secondary)",
            maxWidth: "650px",
            margin: "0 auto 3rem",
            lineHeight: 1.6,
            fontWeight: 400
          }}
        >
          Stop throwing resumes into the void. Connect directly with verified professionals who can refer you to top tech companies.
        </p>
        
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/register"
            className="animate-pulse-glow"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)",
              color: "white",
              fontWeight: 600,
              padding: "1rem 2.5rem",
              borderRadius: "99px",
              textDecoration: "none",
              fontSize: "1.1rem",
              transition: "all 0.3s ease",
            }}
          >
            <Sparkles size={20} />
            Get Started Free
          </Link>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255,255,255,0.03)",
              color: "var(--color-text-primary)",
              fontWeight: 600,
              padding: "1rem 2.5rem",
              borderRadius: "99px",
              textDecoration: "none",
              fontSize: "1.1rem",
              border: "1px solid var(--glass-border)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
          >
            Sign In
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Live Stats Section */}
      <div 
        className="z-content animate-slide-up"
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "2rem",
          width: "100%",
          maxWidth: "1100px",
          marginTop: "6rem",
          marginBottom: "6rem",
          animationDelay: "0.2s"
        }}
      >
        <div className="glass-panel dashboard-card animate-float" style={{ padding: "2.5rem", textAlign: "center", borderTop: "4px solid var(--color-accent)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <div style={{ padding: "1rem", background: "rgba(34, 211, 238, 0.1)", borderRadius: "50%", color: "var(--color-accent)" }}>
              <Users size={36} />
            </div>
          </div>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--color-text-primary)", marginBottom: "0.5rem", lineHeight: 1 }}>
            {totalSeekers.toLocaleString()}
          </div>
          <div style={{ color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem" }}>
            Ambitious Seekers
          </div>
        </div>
        
        <div className="glass-panel dashboard-card animate-float-delayed" style={{ padding: "2.5rem", textAlign: "center", borderTop: "4px solid var(--color-primary-light)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <div style={{ padding: "1rem", background: "rgba(129, 140, 248, 0.1)", borderRadius: "50%", color: "var(--color-primary-light)" }}>
              <Briefcase size={36} />
            </div>
          </div>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--color-text-primary)", marginBottom: "0.5rem", lineHeight: 1 }}>
            {totalReferrers.toLocaleString()}
          </div>
          <div style={{ color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem" }}>
            Verified Referrers
          </div>
        </div>
        
        <div className="glass-panel dashboard-card animate-float-delayed-more" style={{ padding: "2.5rem", textAlign: "center", borderTop: "4px solid var(--color-success)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <div style={{ padding: "1rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "50%", color: "var(--color-success)" }}>
              <CheckCircle2 size={36} />
            </div>
          </div>
          <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--color-text-primary)", marginBottom: "0.5rem", lineHeight: 1 }}>
            {totalRequests.toLocaleString()}
          </div>
          <div style={{ color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem" }}>
            Successful Referrals
          </div>
        </div>
      </div>

      {/* Bento Grid How it Works */}
      <div className="z-content" style={{ width: "100%", maxWidth: "1200px", marginTop: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "inline-block", padding: "0.4rem 1rem", background: "rgba(255,255,255,0.05)", borderRadius: "99px", color: "var(--color-text-muted)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "1.5rem" }}>
            HOW IT WORKS
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, marginBottom: "1.5rem", color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
            Bridging the gap effortlessly.
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1.15rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
            Our platform is designed to effortlessly bridge the gap between ambitious job seekers and verified tech employees.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" }}>
          
          {/* SEEKER BENTO */}
          <div className="glass-panel dashboard-card" style={{ padding: "3rem", background: "linear-gradient(to bottom right, rgba(99,102,241,0.05), transparent)", border: "1px solid rgba(99,102,241,0.1)" }}>
            <div style={{ display: "inline-block", padding: "0.4rem 1rem", background: "rgba(99,102,241,0.15)", color: "var(--color-primary-light)", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "2rem" }}>SEEKER PATH</div>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2.5rem", color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>Land your dream role</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(99,102,241,0.1)", color: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Zap size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.4rem" }}>Upload & Auto-fill</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Our AI instantly extracts your skills and crafts a compelling bio from your resume.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(99,102,241,0.1)", color: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Target size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.4rem" }}>Find Your Match</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Browse verified referrers. Our AI scoring engine shows you your exact match percentage.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(99,102,241,0.1)", color: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.4rem" }}>Connect in Real-Time</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Send a request pitch. Once accepted, jump into a real-time chat to coordinate your application.</p>
                </div>
              </div>
            </div>
          </div>

          {/* REFERRER BENTO */}
          <div className="glass-panel dashboard-card" style={{ padding: "3rem", background: "linear-gradient(to bottom right, rgba(34,211,238,0.05), transparent)", border: "1px solid rgba(34,211,238,0.1)" }}>
            <div style={{ display: "inline-block", padding: "0.4rem 1rem", background: "rgba(34,211,238,0.15)", color: "var(--color-accent)", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "2rem" }}>REFERRER PATH</div>
            <h3 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2.5rem", color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>Find top talent</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(34,211,238,0.1)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.4rem" }}>Verify Your Status</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Sign up with your corporate email. Set your monthly limit to control your inbox.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(34,211,238,0.1)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Users size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.4rem" }}>Review Requests</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Receive highly targeted pitches from candidates whose skills match your open roles.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1.5rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(34,211,238,0.1)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Briefcase size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.4rem" }}>Refer & Earn</h4>
                  <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>Accept candidates, submit them internally, and collect your company's referral bonuses.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <footer style={{ marginTop: "8rem", padding: "2rem", textAlign: "center", borderTop: "1px solid var(--glass-border)", width: "100%", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
        &copy; {new Date().getFullYear()} ReferralAI. Elevating the tech hiring network.
      </footer>
    </main>
  );
}
