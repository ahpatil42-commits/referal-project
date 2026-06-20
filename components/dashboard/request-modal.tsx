"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sendReferralRequest } from "@/actions/seeker";
import { toast } from "sonner";

const schema = z.object({
  jobTitle:  z.string().min(2, "Job title is required"),
  company:   z.string().min(2, "Company is required"),
  jobUrl:    z.string().url("Must be a valid URL").optional().or(z.literal("")),
  coverNote: z.string().min(30, "Write at least 30 characters").max(1000),
});

type FormValues = z.infer<typeof schema>;

interface RequestModalProps {
  referrerId: string;
  referrerName: string;
  referrerCompany: string;
  onClose: () => void;
}

export function RequestModal({
  referrerId,
  referrerName,
  referrerCompany,
  onClose,
}: RequestModalProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { company: referrerCompany },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const res = await sendReferralRequest({ referrerId, ...data });
      if (res.error)   toast.error(res.error);
      if (res.success) {
        toast.success(res.success);
        setTimeout(onClose, 1500);
      }
    });
  };

  return (
    /* Backdrop */
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
      }}
    >
      {/* Modal */}
      <div
        className="glass-panel animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "520px", padding: "2rem", zIndex: 101 }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              Request a Referral
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              to <strong style={{ color: "var(--color-primary-light)" }}>{referrerName}</strong>
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
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Job Title</label>
              <input className={`form-input ${errors.jobTitle ? "error" : ""}`} placeholder="Software Engineer" {...register("jobTitle")} />
              {errors.jobTitle && <p className="form-error">✕ {errors.jobTitle.message}</p>}
            </div>
            <div>
              <label className="form-label">Company</label>
              <input className={`form-input ${errors.company ? "error" : ""}`} placeholder="Google" {...register("company")} />
              {errors.company && <p className="form-error">✕ {errors.company.message}</p>}
            </div>
          </div>

          <div>
            <label className="form-label">Job Posting URL <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span></label>
            <input className={`form-input ${errors.jobUrl ? "error" : ""}`} placeholder="https://careers.google.com/..." {...register("jobUrl")} />
            {errors.jobUrl && <p className="form-error">✕ {errors.jobUrl.message}</p>}
          </div>

          <div>
            <label className="form-label">Cover Note</label>
            <textarea
              className={`form-input ${errors.coverNote ? "error" : ""}`}
              rows={4}
              placeholder="Introduce yourself and explain why you're a great fit for this role..."
              style={{ resize: "vertical", minHeight: "100px" }}
              {...register("coverNote")}
            />
            {errors.coverNote && <p className="form-error">✕ {errors.coverNote.message}</p>}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
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
              {isPending ? <><span className="btn-spinner" />Sending...</> : "Send Request 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
