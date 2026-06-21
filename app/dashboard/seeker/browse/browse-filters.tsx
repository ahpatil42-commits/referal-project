"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Filter } from "lucide-react";

export function BrowseFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [minScore, setMinScore] = useState(searchParams.get("minScore") ?? "0");
  const [showFilters, setShowFilters] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    
    if (query) params.set("q", query);
    else params.delete("q");

    if (minScore !== "0") params.set("minScore", minScore);
    else params.delete("minScore");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "500px" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="Search company or title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="form-input"
          style={{ flex: "1 1 auto", minWidth: "150px", padding: "0.625rem 1rem", fontSize: "0.875rem", background: "rgba(255,255,255,0.05)" }}
        />
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary-hover"
          style={{ padding: "0 1rem", borderRadius: "8px", background: showFilters ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Filter size={16} /> Filters
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isPending}
          style={{ padding: "0 1.25rem", width: "auto", flexShrink: 0 }}
        >
          {isPending ? "..." : "Search"}
        </button>
      </div>

      {showFilters && (
        <div className="glass-panel animate-fade-in-up" style={{ padding: "1rem", marginTop: "0.5rem", border: "1px solid rgba(167, 139, 250, 0.3)" }}>
          <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>Minimum Match Score</label>
          <select 
            className="form-input" 
            value={minScore} 
            onChange={(e) => setMinScore(e.target.value)}
            style={{ width: "100%", marginTop: "0.25rem", cursor: "pointer" }}
          >
            <option value="0">Any Score</option>
            <option value="30">30%+ Match</option>
            <option value="50">50%+ Match</option>
            <option value="70">70%+ Match</option>
            <option value="90">90%+ Match (Top Tier)</option>
          </select>
        </div>
      )}
    </form>
  );
}
