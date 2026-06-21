"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateSeekerProfile } from "@/actions/seeker";
import { toast } from "sonner";
import { ResumeRoaster } from "./resume-roaster";

const schema = z.object({
  headline:    z.string().max(120).optional(),
  bio:         z.string().max(800).optional(),
  skills:      z.string().optional(),
  resumeUrl:   z.string().url("Must be a valid URL").optional().or(z.literal("")),
  resumeStoragePath: z.string().optional(),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl:   z.string().url("Must be a valid URL").optional().or(z.literal("")),
  targetRoles: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface SeekerProfileFormProps {
  initialData: Partial<FormValues & { skills: string | null; targetRoles: string | null; image?: string | null }>;
}

export function SeekerProfileForm({ initialData }: SeekerProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(initialData.image || null);

  // skills/targetRoles stored as JSON string array, display as comma-separated
  const parseList = (val: string | null | undefined) => {
    if (!val) return "";
    try { return JSON.parse(val).join(", "); } catch { return val; }
  };

  const useFormReturn = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      headline:    initialData.headline    ?? "",
      bio:         initialData.bio         ?? "",
      skills:      parseList(initialData.skills),
      resumeUrl:   initialData.resumeUrl   ?? "",
      resumeStoragePath: initialData.resumeStoragePath ?? "",
      linkedinUrl: initialData.linkedinUrl ?? "",
      githubUrl:   initialData.githubUrl   ?? "",
      targetRoles: parseList(initialData.targetRoles),
    },
  });
  const { setValue } = useFormReturn;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"].includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      toast.error("Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse resume");
      }

      // Auto-fill form fields
      if (data.headline) setValue("headline", data.headline, { shouldValidate: true });
      if (data.bio) setValue("bio", data.bio, { shouldValidate: true });
      if (data.skills) setValue("skills", parseList(data.skills), { shouldValidate: true });
      if (data.targetRoles) setValue("targetRoles", parseList(data.targetRoles), { shouldValidate: true });
      if (data.linkedinUrl) setValue("linkedinUrl", data.linkedinUrl, { shouldValidate: true });
      if (data.githubUrl) setValue("githubUrl", data.githubUrl, { shouldValidate: true });
      if (data.resumeStoragePath) setValue("resumeStoragePath", data.resumeStoragePath);

      toast.success("Resume parsed! Review the auto-filled data below.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
      // Reset input so they can re-upload same file if they want
      e.target.value = "";
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      setPreviewImage(data.imageUrl);
      toast.success("Profile photo updated! Refresh to see it in the sidebar.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsImageUploading(false);
      e.target.value = "";
    }
  };

  const onSubmit = (data: FormValues) => {
    // Serialize comma lists → JSON arrays
    const toJson = (s: string | undefined) =>
      s ? JSON.stringify(s.split(",").map((x) => x.trim()).filter(Boolean)) : undefined;

    startTransition(async () => {
      const res = await updateSeekerProfile({
        ...data,
        skills:      toJson(data.skills),
        targetRoles: toJson(data.targetRoles),
      });
      if (res.error)   toast.error(res.error);
      if (res.success) toast.success(res.success);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Profile Photo Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div style={{ 
          width: "80px", height: "80px", borderRadius: "50%", 
          background: "rgba(255,255,255,0.05)", border: "2px solid var(--glass-border)",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" 
        }}>
          {previewImage ? (
            <img src={previewImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "2rem", color: "var(--color-text-muted)" }}>👤</span>
          )}
        </div>
        <div>
          <h4 style={{ margin: "0 0 0.5rem", color: "var(--color-text-primary)" }}>Profile Photo</h4>
          <label className="btn-secondary" style={{ cursor: isImageUploading ? "not-allowed" : "pointer", opacity: isImageUploading ? 0.7 : 1 }}>
            {isImageUploading ? "Uploading..." : "Upload Photo"}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isImageUploading} style={{ display: "none" }} />
          </label>
        </div>
      </div>

    <form onSubmit={useFormReturn.handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* AI Resume Upload Zone */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", alignItems: "stretch" }}>
        <div
          style={{
            border: "2px dashed rgba(99,102,241,0.3)",
            borderRadius: "8px",
            padding: "1.5rem",
            textAlign: "center",
            background: "rgba(99,102,241,0.05)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <div style={{ fontSize: "2rem" }}>📄</div>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: "var(--color-primary-light)", fontWeight: 600, margin: 0 }}>
              Auto-fill with AI
            </h4>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              Upload your PDF, DOCX, or TXT resume to instantly extract your skills and generate a bio.
            </p>
          </div>
          <label
            style={{
              cursor: isUploading ? "not-allowed" : "pointer",
              background: "rgba(255,255,255,0.1)",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 500,
              marginTop: "0.5rem",
              opacity: isUploading ? 0.7 : 1,
              transition: "all 0.2s",
            }}
            className="hover:bg-white/20"
          >
            {isUploading ? "Extracting Data..." : "Choose File"}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
              style={{ display: "none" }}
            />
          </label>
        </div>
        
        <ResumeRoaster />
      </div>

      <div>
        <label className="form-label">Professional Headline</label>
        <input className={`form-input ${useFormReturn.formState.errors.headline ? "error" : ""}`} placeholder="e.g. Full-Stack Engineer with 3 years of React experience" {...useFormReturn.register("headline")} />
        {useFormReturn.formState.errors.headline && <p className="form-error">✕ {useFormReturn.formState.errors.headline.message}</p>}
      </div>

      <div>
        <label className="form-label">Bio</label>
        <textarea className={`form-input ${useFormReturn.formState.errors.bio ? "error" : ""}`} rows={4} placeholder="Tell referrers about yourself, your goals, and what makes you a strong candidate..." style={{ resize: "vertical" }} {...useFormReturn.register("bio")} />
        {useFormReturn.formState.errors.bio && <p className="form-error">✕ {useFormReturn.formState.errors.bio.message}</p>}
      </div>

      <div>
        <label className="form-label">Skills <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(comma-separated)</span></label>
        <input className="form-input" placeholder="e.g. React, TypeScript, Node.js, PostgreSQL" {...useFormReturn.register("skills")} />
      </div>

      <div>
        <label className="form-label">Target Roles <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(comma-separated)</span></label>
        <input className="form-input" placeholder="e.g. Frontend Engineer, Full-Stack Engineer" {...useFormReturn.register("targetRoles")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label className="form-label">LinkedIn URL</label>
          <input className={`form-input ${useFormReturn.formState.errors.linkedinUrl ? "error" : ""}`} placeholder="https://linkedin.com/in/..." {...useFormReturn.register("linkedinUrl")} />
          {useFormReturn.formState.errors.linkedinUrl && <p className="form-error">✕ {useFormReturn.formState.errors.linkedinUrl.message}</p>}
        </div>
        <div>
          <label className="form-label">GitHub URL</label>
          <input className={`form-input ${useFormReturn.formState.errors.githubUrl ? "error" : ""}`} placeholder="https://github.com/..." {...useFormReturn.register("githubUrl")} />
          {useFormReturn.formState.errors.githubUrl && <p className="form-error">✕ {useFormReturn.formState.errors.githubUrl.message}</p>}
        </div>
      </div>

      <div>
        <label className="form-label">Resume URL <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(optional)</span></label>
        <input className={`form-input ${useFormReturn.formState.errors.resumeUrl ? "error" : ""}`} placeholder="https://drive.google.com/..." {...useFormReturn.register("resumeUrl")} />
        {useFormReturn.formState.errors.resumeUrl && <p className="form-error">✕ {useFormReturn.formState.errors.resumeUrl.message}</p>}
      </div>

      <button type="submit" className="btn-primary" disabled={isPending} style={{ marginTop: "0.5rem" }}>
        {isPending ? <><span className="btn-spinner" />Saving...</> : "Save Profile"}
      </button>
    </form>
    </div>
  );
}
