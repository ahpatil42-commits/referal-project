"use client";

import { useState, useTransition } from "react";
import { analyzeFeedbackWithAI } from "@/actions/admin-feedback";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type Feedback = {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
  user: { email: string; name: string | null; role: string };
};

export function AdminFeedbackAnalyzer({ initialFeedbacks }: { initialFeedbacks: Feedback[] }) {
  const [isPending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleAnalyze = () => {
    startTransition(async () => {
      const res = await analyzeFeedbackWithAI();
      if (res.error) {
        toast.error(res.error);
      } else if (res.analysis) {
        setAnalysis(res.analysis);
        toast.success("AI Analysis complete!");
      }
    });
  };

  return (
    <div style={{ marginTop: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
          User Feedback Analyzer
        </h2>
        <button 
          onClick={handleAnalyze} 
          disabled={isPending}
          className="btn-primary"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, var(--color-primary))",
            border: "none",
            gap: "0.5rem",
          }}
        >
          {isPending ? "Generating..." : "✨ Analyze Feedback with AI"}
        </button>
      </div>

      {analysis && (
        <div className="glass-panel animate-fade-in-up" style={{ padding: "2rem", marginBottom: "2rem", background: "rgba(139, 92, 246, 0.05)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
          <h3 style={{ color: "#a78bfa", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>✨</span> AI Feedback Report
          </h3>
          <div style={{ color: "var(--color-text-primary)", lineHeight: 1.6 }} className="markdown-body">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--glass-border)" }}>
              <th style={{ padding: "1rem", color: "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem" }}>User</th>
              <th style={{ padding: "1rem", color: "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem" }}>Type</th>
              <th style={{ padding: "1rem", color: "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem" }}>Message</th>
              <th style={{ padding: "1rem", color: "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {initialFeedbacks.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                  No feedback found.
                </td>
              </tr>
            ) : (
              initialFeedbacks.map((fb) => (
                <tr key={fb.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                  <td style={{ padding: "1rem", minWidth: "150px" }}>
                    <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{fb.user.name || "Anonymous"}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{fb.user.email}</div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.6rem", borderRadius: "99px",
                      background: fb.type === "BUG" ? "rgba(239,68,68,0.15)" : fb.type === "FEATURE_REQUEST" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                      color: fb.type === "BUG" ? "#fca5a5" : fb.type === "FEATURE_REQUEST" ? "var(--color-primary-light)" : "var(--color-text-muted)",
                      letterSpacing: "0.05em"
                    }}>
                      {fb.type.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", color: "var(--color-text-primary)", fontSize: "0.95rem", maxWidth: "400px", lineHeight: 1.5 }}>
                    {fb.message}
                  </td>
                  <td style={{ padding: "1rem", color: "var(--color-text-muted)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: var(--color-text-primary); margin-top: 1rem; margin-bottom: 0.5rem; }
        .markdown-body p { margin-bottom: 1rem; }
        .markdown-body ul, .markdown-body ol { margin-left: 1.5rem; margin-bottom: 1rem; }
        .markdown-body li { margin-bottom: 0.25rem; }
        .markdown-body strong { color: var(--color-text-primary); font-weight: 700; }
      `}</style>
    </div>
  );
}
