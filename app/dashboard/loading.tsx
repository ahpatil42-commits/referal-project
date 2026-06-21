export default function DashboardLoading() {
  return (
    <div className="animate-pulse" style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", maxWidth: "1200px" }}>
      {/* Header Skeleton */}
      <div style={{ height: "48px", width: "300px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }} />
      
      {/* Stats Cards Skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: "120px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }} />
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div style={{ height: "400px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", marginTop: "2rem" }} />
    </div>
  );
}
