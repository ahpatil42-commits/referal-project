export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem", lineHeight: 1.6, color: "var(--color-text-secondary)" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-primary)", marginBottom: "2rem" }}>Privacy Policy</h1>
      
      <p style={{ marginBottom: "1.5rem" }}>Last Updated: {new Date().toLocaleDateString()}</p>
      
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "2rem", marginBottom: "1rem" }}>1. Information We Collect</h2>
      <p style={{ marginBottom: "1.5rem" }}>We collect information you provide directly to us when you create an account, update your profile, upload a resume, or communicate with others on the platform. This includes personal information such as your name, email address, work history, and skills.</p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "2rem", marginBottom: "1rem" }}>2. How We Use Your Information</h2>
      <p style={{ marginBottom: "1.5rem" }}>We use the information we collect to provide, maintain, and improve our services, including matching you with relevant job opportunities or candidates, and parsing your resume using AI to streamline your profile creation.</p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "2rem", marginBottom: "1rem" }}>3. Data Sharing</h2>
      <p style={{ marginBottom: "1.5rem" }}>When you submit a referral request, your profile and resume are shared with the specific referrer you chose. We do not sell your personal data to third-party marketers.</p>

      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)", marginTop: "2rem", marginBottom: "1rem" }}>4. Data Security</h2>
      <p style={{ marginBottom: "1.5rem" }}>We implement reasonable security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
    </div>
  );
}
