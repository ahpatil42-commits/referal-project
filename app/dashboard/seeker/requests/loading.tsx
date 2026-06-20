import { Skeleton } from "@/components/ui/skeleton";

export default function SeekerRequestsLoading() {
  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
          My Requests 📬
        </h1>
        <Skeleton style={{ width: "150px", height: "1.2rem", marginTop: "0.25rem" }} />
      </div>

      {/* List of Skeleton Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-panel" style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "250px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Skeleton style={{ width: "120px", height: "1.2rem" }} />
                <span style={{ color: "var(--color-text-muted)" }}>@</span>
                <Skeleton style={{ width: "80px", height: "1.2rem" }} />
              </div>
              <Skeleton style={{ width: "60%", height: "0.9rem" }} />
              <Skeleton style={{ width: "100px", height: "0.8rem", marginTop: "0.25rem" }} />
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Skeleton style={{ width: "80px", height: "24px", borderRadius: "9999px" }} />
              <Skeleton style={{ width: "32px", height: "32px", borderRadius: "var(--radius-sm)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
