import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { db } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { image: true, emailVerified: true }
  });

  if (!user?.emailVerified) {
    redirect("/pending-verification");
  }

  return (
    <div
      className="bg-space"
      style={{ display: "flex", minHeight: "100vh" }}
    >
      {/* Left Ad Sidebar (Far Left) */}
      <aside 
        className="ad-sidebar"
        style={{ 
          width: "260px", 
          borderRight: "1px solid var(--glass-border)", 
          padding: "2rem 1.5rem", 
          display: "flex", 
          flexDirection: "column", 
          gap: "2rem", 
          overflowY: "auto",
          background: "linear-gradient(to right, transparent, rgba(255,255,255,0.01))"
        }}
      >
        <div style={{ color: "var(--color-text-muted)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textAlign: "center", textTransform: "uppercase" }}>
          Sponsored
        </div>
        <div className="glass-panel" style={{ height: "600px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.85rem", opacity: 0.5 }}>
          Ad Space (Left)
        </div>
      </aside>

      <Sidebar role={session.user.role} email={session.user.email ?? ""} image={user?.image ?? null} />
      
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Main Content */}
        <main
          className="z-content"
          style={{
            flex: 1,
            padding: "2rem",
            overflowX: "hidden",
            overflowY: "auto",
            minWidth: 0,
            maxWidth: "1100px",
            margin: "0 auto",
            position: "relative"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <Breadcrumbs />
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
          {children}
        </main>

        {/* Right Ad Sidebar */}
        <aside 
          className="ad-sidebar"
          style={{ 
            width: "260px", 
            borderLeft: "1px solid var(--glass-border)", 
            padding: "2rem 1.5rem", 
            display: "flex", 
            flexDirection: "column", 
            gap: "2rem", 
            overflowY: "auto",
            background: "linear-gradient(to left, transparent, rgba(255,255,255,0.01))"
          }}
        >
          <div style={{ color: "var(--color-text-muted)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textAlign: "center", textTransform: "uppercase" }}>
            Sponsored
          </div>
          <div className="glass-panel" style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.85rem", opacity: 0.5 }}>
            Ad Space (Right Top)
          </div>
          <div className="glass-panel" style={{ height: "500px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.85rem", opacity: 0.5 }}>
            Ad Space (Right Bottom)
          </div>
        </aside>
      </div>
    </div>
  );
}
