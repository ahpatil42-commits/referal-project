"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  if (!pathname || pathname === "/dashboard") return null;

  const paths = pathname.split("/").filter(Boolean);
  
  return (
    <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", color: "var(--color-text-muted)", fontSize: "0.85rem", fontWeight: 500 }}>
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit", transition: "color 0.2s" }} className="hover:text-white">
        <Home size={14} style={{ marginRight: "0.25rem" }} />
      </Link>
      
      {paths.map((path, index) => {
        // Skip first "dashboard" segment since home icon covers it
        if (index === 0 && path === "dashboard") return null;
        
        const href = "/" + paths.slice(0, index + 1).join("/");
        const isLast = index === paths.length - 1;
        const formattedPath = path.charAt(0).toUpperCase() + path.slice(1);

        return (
          <div key={path} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ChevronRight size={14} style={{ opacity: 0.5 }} />
            {isLast ? (
              <span style={{ color: "var(--color-primary-light)", fontWeight: 600 }}>{formattedPath}</span>
            ) : (
              <Link href={href} style={{ textDecoration: "none", color: "inherit", transition: "color 0.2s" }} className="hover:text-white">
                {formattedPath}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
