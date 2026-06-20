import { Skeleton } from "@/components/ui/skeleton";

export default function ReferrerRequestsLoading() {
  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
          Incoming Requests 📥
        </h1>
        <Skeleton style={{ width: "200px", height: "1.2rem", marginTop: "0.25rem" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: "1rem", letterSpacing: "0.05em" }}>
            AWAITING REVIEW
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Header row */}
                <div style={{ display: "flex", gap: "0.625rem" }}>
                  <Skeleton style={{ width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <Skeleton style={{ width: "100px", height: "1rem" }} />
                    <Skeleton style={{ width: "80%", height: "0.8rem" }} />
                  </div>
                  <Skeleton style={{ width: "80px", height: "24px", borderRadius: "9999px" }} />
                </div>

                {/* Job Info */}
                <Skeleton style={{ width: "100%", height: "48px", borderRadius: "var(--radius-md)" }} />

                {/* Skills chips */}
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <Skeleton style={{ width: "50px", height: "20px", borderRadius: "9999px" }} />
                  <Skeleton style={{ width: "70px", height: "20px", borderRadius: "9999px" }} />
                  <Skeleton style={{ width: "60px", height: "20px", borderRadius: "9999px" }} />
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <Skeleton style={{ flex: 1, height: "40px", borderRadius: "var(--radius-md)" }} />
                  <Skeleton style={{ flex: 2, height: "40px", borderRadius: "var(--radius-md)" }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
