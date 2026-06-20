"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", width: "100%", maxWidth: "400px" }}>
      <input
        type="text"
        placeholder="Search by company or title..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="form-input"
        style={{ flex: 1, padding: "0.625rem 1rem", fontSize: "0.875rem", background: "rgba(255,255,255,0.05)" }}
      />
      <button
        type="submit"
        className="btn-primary"
        disabled={isPending}
        style={{ padding: "0 1.25rem" }}
      >
        {isPending ? "..." : "Search"}
      </button>
    </form>
  );
}
