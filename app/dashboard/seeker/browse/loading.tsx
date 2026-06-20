import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseLoading() {
  return (
    <div style={{ maxWidth: "1200px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
            Browse Referrers 🔍
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginTop: "0.25rem" }}>
            Find professionals offering referrals.
          </p>
        </div>
        <Skeleton style={{ width: "250px", height: "42px", borderRadius: "9999px" }} />
      </div>

      {/* Grid of Skeleton Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Header info */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <Skeleton style={{ width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Skeleton style={{ width: "60%", height: "1.2rem" }} />
                <Skeleton style={{ width: "80%", height: "0.9rem" }} />
              </div>
            </div>
            
            {/* Divider */}
            <div style={{ height: "1px", background: "var(--glass-border)", width: "100%" }} />
            
            {/* Match score / bio */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Skeleton style={{ width: "40%", height: "1rem" }} />
              <Skeleton style={{ width: "100%", height: "0.8rem" }} />
              <Skeleton style={{ width: "90%", height: "0.8rem" }} />
              <Skeleton style={{ width: "50%", height: "0.8rem" }} />
            </div>

            {/* Button */}
            <Skeleton style={{ width: "100%", height: "40px", marginTop: "auto" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
