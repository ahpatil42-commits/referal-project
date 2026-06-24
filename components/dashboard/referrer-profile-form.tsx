"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateReferrerProfile } from "@/actions/referrer";
import { updateProfileImage } from "@/actions/settings";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";

const schema = z.object({
  company:        z.string().max(100).optional(),
  jobTitle:       z.string().max(100).optional(),
  yearsAtCompany: z.coerce.number().int().min(0).max(50).optional(),
  bio:            z.string().max(800).optional(),
  corporateEmail: z.string().email("Must be a valid email").optional().or(z.literal("")),
  linkedinUrl:    z.string().url("Must be a valid URL").optional().or(z.literal("")),
  maxReferrals:   z.coerce.number().int().min(1).max(20).optional(),
});

type FormValues = z.infer<typeof schema>;

interface ReferrerProfileFormProps {
  initialData: Partial<FormValues & { image?: string | null }>;
}

export function ReferrerProfileForm({ initialData }: ReferrerProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(initialData.image || null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company:        initialData.company        ?? "",
      jobTitle:       initialData.jobTitle       ?? "",
      yearsAtCompany: initialData.yearsAtCompany ?? undefined,
      bio:            initialData.bio            ?? "",
      corporateEmail: initialData.corporateEmail ?? "",
      linkedinUrl:    initialData.linkedinUrl    ?? "",
      maxReferrals:   initialData.maxReferrals   ?? 3,
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setIsImageUploading(true);
    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: 'avatar',
      });
      await handleImageUploadComplete(newBlob.url);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
      setIsImageUploading(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const res = await updateReferrerProfile(data);
      if (res.error)   toast.error(res.error);
      if (res.success) toast.success(res.success);
    });
  };

  const handleImageUploadComplete = async (url: string) => {
    setIsImageUploading(true);
    try {
      const res = await updateProfileImage(url);
      if (res.error) throw new Error(res.error);
      
      setPreviewImage(url);
      toast.success("Profile photo updated! Refresh to see it in the sidebar.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsImageUploading(false);
    }
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
          <div style={{ pointerEvents: isImageUploading ? "none" : "auto", opacity: isImageUploading ? 0.7 : 1 }}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              disabled={isImageUploading}
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: "0.5rem",
                padding: "0.5rem",
                color: "var(--color-text-primary)",
                width: "100%",
                cursor: "pointer"
              }}
            />
          </div>
        </div>
      </div>

    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label className="form-label">Company</label>
          <input className={`form-input ${errors.company ? "error" : ""}`} placeholder="e.g. Google" {...register("company")} />
          {errors.company && <p className="form-error">✕ {errors.company.message}</p>}
        </div>
        <div>
          <label className="form-label">Job Title</label>
          <input className={`form-input ${errors.jobTitle ? "error" : ""}`} placeholder="e.g. Senior Software Engineer" {...register("jobTitle")} />
          {errors.jobTitle && <p className="form-error">✕ {errors.jobTitle.message}</p>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label className="form-label">Years at Company</label>
          <input type="number" min={0} max={50} className={`form-input ${errors.yearsAtCompany ? "error" : ""}`} placeholder="e.g. 3" {...register("yearsAtCompany")} />
          {errors.yearsAtCompany && <p className="form-error">✕ {errors.yearsAtCompany.message}</p>}
        </div>
        <div>
          <label className="form-label">Max Referrals / Month</label>
          <input type="number" min={1} max={20} className={`form-input ${errors.maxReferrals ? "error" : ""}`} {...register("maxReferrals")} />
          {errors.maxReferrals && <p className="form-error">✕ {errors.maxReferrals.message}</p>}
        </div>
      </div>

      <div>
        <label className="form-label">Bio</label>
        <textarea className={`form-input ${errors.bio ? "error" : ""}`} rows={4} placeholder="Tell seekers about yourself, your role, and what kind of candidates you prefer to refer..." style={{ resize: "vertical" }} {...register("bio")} />
        {errors.bio && <p className="form-error">✕ {errors.bio.message}</p>}
      </div>

      <div>
        <label className="form-label">Corporate Email</label>
        <input type="email" className={`form-input ${errors.corporateEmail ? "error" : ""}`} placeholder="you@company.com" {...register("corporateEmail")} />
        {errors.corporateEmail && <p className="form-error">✕ {errors.corporateEmail.message}</p>}
      </div>

      <div>
        <label className="form-label">LinkedIn URL</label>
        <input className={`form-input ${errors.linkedinUrl ? "error" : ""}`} placeholder="https://linkedin.com/in/..." {...register("linkedinUrl")} />
        {errors.linkedinUrl && <p className="form-error">✕ {errors.linkedinUrl.message}</p>}
      </div>

      <button type="submit" className="btn-primary" disabled={isPending} style={{ marginTop: "0.5rem" }}>
        {isPending ? <><span className="btn-spinner" />Saving...</> : "Save Profile"}
      </button>
    </form>
    </div>
  );
}
