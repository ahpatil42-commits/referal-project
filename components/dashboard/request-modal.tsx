"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sendReferralRequest } from "@/actions/seeker";
import { toast } from "sonner";
import { Sparkles, Loader2, Send } from "lucide-react";

const schema = z.object({
  jobTitle:  z.string().min(2, "Job title is required"),
  company:   z.string().min(2, "Company is required"),
  jobUrl:    z.string().url("Must be a valid URL").optional().or(z.literal("")),
  coverNote: z.string().min(30, "Write at least 30 characters").max(1000),
});

type FormValues = z.infer<typeof schema>;

type PostingDetails = {
  jobTitle: string;
  company: string;
  jobUrl?: string | null;
  description?: string | null;
  experience?: string | null;
  skills?: string | null;
  location?: string | null;
};

interface RequestModalProps {
  referrerId: string;
  referrerName: string;
  referrerCompany: string;
  defaultPosting?: PostingDetails;
  onClose: () => void;
}

type Message = { role: "user" | "model"; content: string };

export function RequestModal({
  referrerId,
  referrerName,
  referrerCompany,
  defaultPosting,
  onClose,
}: RequestModalProps) {
  const [isPending, startTransition] = useTransition();
  const [showSidebarOffset, setShowSidebarOffset] = useState(false);

  useEffect(() => {
    const updateOffset = () => setShowSidebarOffset(window.innerWidth >= 900);
    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  const defaultValues: FormValues = {
    jobTitle: defaultPosting?.jobTitle || "",
    company: defaultPosting?.company || referrerCompany,
    jobUrl: defaultPosting?.jobUrl || "",
    coverNote: "",
  };

  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const [jdText, setJdText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [showJdInput, setShowJdInput] = useState(false);

  // AI Mock Interview State
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keyboard Accessibility: Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleAutofill = async () => {
    if (!jdText.trim()) return toast.error("Please paste a Job Description first.");
    
    setIsParsing(true);
    try {
      const res = await fetch("/api/jd/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: jdText, type: "REQUEST" }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.jobTitle) setValue("jobTitle", data.jobTitle, { shouldValidate: true });
      if (data.company) setValue("company", data.company, { shouldValidate: true });
      if (data.coverNote) setValue("coverNote", data.coverNote, { shouldValidate: true });
      
      toast.success("Autofilled from Job Description!");
      setShowJdInput(false);
      setJdText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to parse JD");
    } finally {
      setIsParsing(false);
    }
  };

  const startMockInterview = async (data: FormValues) => {
    setIsInterviewing(true);
    setMessages([]);
    setIsAiTyping(true);

    try {
      const res = await fetch("/api/ai/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "I am ready." }],
          jobTitle: data.jobTitle,
          company: data.company,
          coverNote: data.coverNote,
        }),
      });

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      setMessages([{ role: "model", content: json.text }]);
    } catch (error: any) {
      toast.error("Failed to start mock interview.");
      setIsInterviewing(false);
    } finally {
      setIsAiTyping(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: chatInput }];
    setMessages(newMessages);
    setChatInput("");
    setIsAiTyping(true);

    try {
      const data = getValues();
      const res = await fetch("/api/ai/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          jobTitle: data.jobTitle,
          company: data.company,
          coverNote: data.coverNote,
        }),
      });

      const json = await res.json();
      if (json.error) throw new Error(json.error);

      const aiResponse = json.text;
      
      if (aiResponse.includes("[VERIFIED]")) {
        toast.success("AI Verification Passed!");
        setMessages([...newMessages, { role: "model", content: "Excellent answer. You are verified! Sending pitch now..." }]);
        
        // Auto submit the actual request
        setTimeout(() => {
          submitActualRequest(data);
        }, 1500);
      } else {
        setMessages([...newMessages, { role: "model", content: aiResponse }]);
      }

    } catch (error: any) {
      toast.error("Failed to get AI response.");
    } finally {
      setIsAiTyping(false);
    }
  };

  const submitActualRequest = (data: FormValues) => {
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
        paddingLeft: showSidebarOffset ? "calc(220px + 1.5rem)" : "1.5rem",
      }}
    >
      <div
        className="glass-panel animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "600px", padding: "2rem", zIndex: 101, display: "flex", flexDirection: "column", maxHeight: "85vh" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              {isInterviewing ? "AI Mock Interview" : "Request a Referral"}
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
              {isInterviewing ? "The AI will test your knowledge before sending." : <>to <strong style={{ color: "var(--color-primary-light)" }}>{referrerName}</strong></>}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
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

        {isInterviewing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1, overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", paddingRight: "0.5rem" }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", background: msg.role === "user" ? "var(--color-primary)" : "rgba(255,255,255,0.05)", padding: "0.75rem 1rem", borderRadius: "12px", maxWidth: "85%", color: msg.role === "user" ? "white" : "var(--color-text-primary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                  {msg.content.replace("[VERIFIED]", "")}
                </div>
              ))}
              {isAiTyping && (
                <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.05)", padding: "0.75rem 1rem", borderRadius: "12px", color: "var(--color-text-muted)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Loader2 size={14} className="animate-spin" /> AI is typing...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                className="form-input"
                style={{ flex: 1, margin: 0 }}
                placeholder="Type your answer..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendChatMessage(); }}
                disabled={isAiTyping || isPending}
              />
              <button
                className="btn-primary"
                style={{ padding: "0 1rem", width: "auto", flex: "none" }}
                onClick={sendChatMessage}
                disabled={isAiTyping || isPending || !chatInput.trim()}
              >
                {isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        ) : (
          <>
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

            {defaultPosting && (
              <div style={{ marginBottom: "1.25rem", padding: "1rem", background: "rgba(255,255,255,0.04)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                      {defaultPosting.jobTitle} @ {defaultPosting.company}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", color: "var(--color-text-secondary)", fontSize: "0.82rem" }}>
                      {defaultPosting.location && <span>📍 {defaultPosting.location}</span>}
                      {defaultPosting.experience && <span>⏱ {defaultPosting.experience}</span>}
                      {defaultPosting.skills && <span>⚡ {defaultPosting.skills}</span>}
                    </div>
                  </div>
                  {defaultPosting.jobUrl && (
                    <a href={defaultPosting.jobUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-purple)", textDecoration: "underline", fontSize: "0.9rem", fontWeight: 600 }}>
                      Open Job Posting ↗
                    </a>
                  )}
                </div>
                {defaultPosting.description && (
                  <div style={{ marginTop: "0.75rem", maxHeight: "180px", overflowY: "auto", padding: "0.85rem", background: "rgba(0,0,0,0.12)", borderRadius: "10px", color: "var(--color-text-secondary)", lineHeight: 1.7, fontSize: "0.9rem" }}>
                    {defaultPosting.description}
                  </div>
                )}
              </div>
            )}

            <form style={{ display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", paddingRight: "0.5rem" }}>
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
                  type="button"
                  onClick={handleSubmit(startMockInterview)}
                  disabled={isPending || isInterviewing}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Practice Interview 🤖
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(submitActualRequest)}
                  disabled={isPending || isInterviewing}
                  className="btn-primary"
                  style={{ flex: 1.5 }}
                >
                  Send Request 🚀
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
