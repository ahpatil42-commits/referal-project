"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ResumeRoaster() {
  const [isRoasting, setIsRoasting] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string[] } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"].includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      toast.error("Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    
    setIsRoasting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/ai/roast-resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to roast resume");
      }

      setResult(data);
      toast.success("Resume analyzed!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsRoasting(false);
      e.target.value = "";
    }
  };

  return (
    <div
      style={{
        border: "2px dashed rgba(239, 68, 68, 0.3)",
        borderRadius: "8px",
        padding: "1.5rem",
        textAlign: "center",
        background: "rgba(239, 68, 68, 0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <div style={{ fontSize: "2rem" }}>🔥</div>
      <div style={{ flex: 1 }}>
        <h4 style={{ color: "#ef4444", fontWeight: 600, margin: 0 }}>
          AI Resume Roaster
        </h4>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
          Upload your resume to get brutal, honest AI feedback on how to improve your ATS score before sending it to referrers.
        </p>
      </div>
      
      <label
        style={{
          cursor: isRoasting ? "not-allowed" : "pointer",
          background: "rgba(239, 68, 68, 0.15)",
          color: "#fca5a5",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          fontSize: "0.85rem",
          fontWeight: 600,
          marginTop: "0.5rem",
          opacity: isRoasting ? 0.7 : 1,
          transition: "all 0.2s",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        }}
        className="hover:bg-red-500/20"
      >
        {isRoasting ? "Analyzing..." : "Roast My Resume"}
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileUpload}
          disabled={isRoasting}
          style={{ display: "none" }}
        />
      </label>

      {result && (
        <div style={{ marginTop: "1.5rem", width: "100%", textAlign: "left", background: "rgba(0,0,0,0.2)", padding: "1.25rem", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.75rem" }}>
            <h5 style={{ margin: 0, color: "var(--color-text-primary)", fontSize: "1.1rem" }}>ATS Match Score</h5>
            <div style={{ 
              fontSize: "1.5rem", 
              fontWeight: 800, 
              color: result.score >= 80 ? "var(--color-success)" : result.score >= 60 ? "var(--color-warning)" : "#ef4444"
            }}>
              {result.score}/100
            </div>
          </div>
          
          <h6 style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Brutal Feedback:</h6>
          <ul style={{ paddingLeft: "1.5rem", margin: 0, color: "var(--color-text-muted)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {result.feedback.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
