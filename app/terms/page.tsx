export default function TermsPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem", lineHeight: 1.6, color: "var(--color-text-secondary)" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "2rem" }}>Terms of Service</h1>
      
      <p style={{ marginBottom: "1.5rem" }}>Last Updated: {new Date().toLocaleDateString()}</p>
      
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "2rem", marginBottom: "1rem" }}>1. Acceptance of Terms</h2>
      <p style={{ marginBottom: "1.5rem" }}>By accessing and using ReferralAI, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our platform.</p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "2rem", marginBottom: "1rem" }}>2. User Conduct</h2>
      <p style={{ marginBottom: "1.5rem" }}>You agree to use this platform for lawful professional networking only. You must provide accurate information in your profile and when sending or accepting referral requests. Misrepresentation, spam, or harassment will result in immediate termination of your account.</p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "2rem", marginBottom: "1rem" }}>3. Service Limitations</h2>
      <p style={{ marginBottom: "1.5rem" }}>ReferralAI is a facilitation platform. We do not guarantee job placements, interviews, or that a referrer will accept your request or successfully submit you to their company.</p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "2rem", marginBottom: "1rem" }}>4. Termination</h2>
      <p style={{ marginBottom: "1.5rem" }}>We reserve the right to suspend or terminate your account at any time for violating these terms or for any other reason at our sole discretion.</p>
    </div>
  );
}
