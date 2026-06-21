"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createReferralPosting } from "@/actions/posting";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

const schema = z.object({
  jobTitle: z.string().min(2, "Job title is required"),
  company: z.string().min(2, "Company is required"),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  experience: z.string().optional(),
  skills: z.string().optional(),
  location: z.string().optional(),
  noticePeriod: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function PostingModal({ onClose, defaultCompany }: { onClose: () => void, defaultCompany?: string }) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { company: defaultCompany || "" },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const res = await createReferralPosting(data);
      if (res.error) toast.error(res.error);
      if (res.success) {
        toast.success(res.success);
        setTimeout(onClose, 1000);
      }
    });
  };

  const [jdText, setJdText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [showJdInput, setShowJdInput] = useState(false);

  const handleAutofill = async () => {
    if (!jdText.trim()) return toast.error("Please paste a Job Description first.");
    
    setIsParsing(true);
    try {
      const res = await fetch("/api/jd/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: jdText, type: "POSTING" }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.jobTitle) setValue("jobTitle", data.jobTitle, { shouldValidate: true });
      if (data.company) setValue("company", data.company, { shouldValidate: true });
      if (data.experience) setValue("experience", data.experience, { shouldValidate: true });
      if (data.skills) setValue("skills", data.skills, { shouldValidate: true });
      if (data.location) setValue("location", data.location, { shouldValidate: true });
      if (data.noticePeriod) setValue("noticePeriod", data.noticePeriod, { shouldValidate: true });
      if (data.description) setValue("description", data.description, { shouldValidate: true });
      
      toast.success("Autofilled from Job Description!");
      setShowJdInput(false);
      setJdText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to parse JD");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        paddingLeft: "calc(220px + 1.5rem)",
      }}
    >
      <div
        className="glass-panel animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "700px", padding: "2rem", zIndex: 101, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              Add a Referral Role
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              Post a role you are willing to refer candidates for.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-muted)",
              fontSize: "1.25rem",
              cursor: "pointer",
              padding: "0.25rem",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* AI Autofill Toggle */}
        {!showJdInput && (
          <button
            type="button"
            onClick={() => setShowJdInput(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(167, 139, 250, 0.1)",
              border: "1px solid rgba(167, 139, 250, 0.3)",
              color: "var(--color-purple)",
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              fontSize: "0.825rem",
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: "1.25rem",
              width: "100%",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            className="hover:bg-purple-500/20"
          >
            <Sparkles size={16} />
            Autofill with AI (Paste JD)
          </button>
        )}

        {showJdInput && (
          <div style={{ marginBottom: "1.25rem", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <label className="form-label" style={{ margin: 0 }}>Paste Job Description</label>
              <button type="button" onClick={() => setShowJdInput(false)} style={{ background: "none", border: "none", color: "var(--color-text-muted)", fontSize: "0.75rem", cursor: "pointer" }}>Cancel</button>
            </div>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="form-input"
              rows={4}
              placeholder="Paste the full job description here..."
              style={{ resize: "vertical", fontSize: "0.8rem", marginBottom: "0.75rem" }}
            />
            <button
              type="button"
              onClick={handleAutofill}
              disabled={isParsing || !jdText.trim()}
              style={{
                width: "100%",
                background: "var(--color-purple)",
                color: "white",
                border: "none",
                padding: "0.5rem",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: (isParsing || !jdText.trim()) ? "not-allowed" : "pointer",
                opacity: (isParsing || !jdText.trim()) ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              {isParsing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isParsing ? "Extracting Details..." : "Autofill Fields"}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Job Title</label>
              <input className={`form-input ${errors.jobTitle ? "error" : ""}`} placeholder="Frontend Engineer" {...register("jobTitle")} />
              {errors.jobTitle && <p className="form-error">✕ {errors.jobTitle.message}</p>}
            </div>
            <div>
              <label className="form-label">Company</label>
              <input className={`form-input ${errors.company ? "error" : ""}`} placeholder="Company Name" {...register("company")} />
              {errors.company && <p className="form-error">✕ {errors.company.message}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Job Posting URL <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span></label>
            <input className={`form-input ${errors.jobUrl ? "error" : ""}`} placeholder="https://careers.company.com/..." {...register("jobUrl")} />
            {errors.jobUrl && <p className="form-error">✕ {errors.jobUrl.message}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Experience <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span></label>
              <textarea className={`form-input ${errors.experience ? "error" : ""}`} rows={2} placeholder="e.g. 3+ years" style={{ resize: "vertical" }} {...register("experience")} />
              {errors.experience && <p className="form-error">✕ {errors.experience.message}</p>}
            </div>
            <div>
              <label className="form-label">Skills <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span></label>
              <textarea className={`form-input ${errors.skills ? "error" : ""}`} rows={2} placeholder="e.g. React, Node.js" style={{ resize: "vertical" }} {...register("skills")} />
              {errors.skills && <p className="form-error">✕ {errors.skills.message}</p>}
            </div>
            <div>
              <label className="form-label">Location <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span></label>
              <textarea className={`form-input ${errors.location ? "error" : ""}`} rows={2} placeholder="e.g. Remote, NY" style={{ resize: "vertical" }} {...register("location")} />
              {errors.location && <p className="form-error">✕ {errors.location.message}</p>}
            </div>
            <div>
              <label className="form-label">Notice Period <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span></label>
              <textarea className={`form-input ${errors.noticePeriod ? "error" : ""}`} rows={2} placeholder="e.g. 30 days, Immediate" style={{ resize: "vertical" }} {...register("noticePeriod")} />
              {errors.noticePeriod && <p className="form-error">✕ {errors.noticePeriod.message}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Summary / Notes <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span></label>
            <textarea
              className={`form-input ${errors.description ? "error" : ""}`}
              rows={5}
              placeholder="Looking for 3+ years experience with React..."
              style={{ resize: "vertical" }}
              {...register("description")}
            />
            {errors.description && <p className="form-error">✕ {errors.description.message}</p>}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.7rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--glass-border)",
                background: "var(--glass-bg)",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.9rem",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
              style={{ flex: 2 }}
            >
              {isPending ? <><span className="btn-spinner" />Saving...</> : "Post Role 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
