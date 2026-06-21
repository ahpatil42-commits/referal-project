"use client";

import { useState } from "react";
import { updateMobileNumber, sendVerificationOtp, verifyOtp } from "@/actions/settings";
import { toast } from "sonner";

interface AccountVerificationSettingsProps {
  email: string;
  emailVerified: boolean;
  mobile: string | null;
  mobileVerified: boolean;
}

export function AccountVerificationSettings({ email, emailVerified, mobile, mobileVerified }: AccountVerificationSettingsProps) {
  const knownCountryCodes = ["+1", "+44", "+91", "+61", "+49", "+86", "+81"];
  const initialCountryCode = knownCountryCodes.find(c => mobile?.startsWith(c)) || "+1";
  const initialMobile = mobile ? mobile.replace(initialCountryCode, "") : "";

  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [countryCodeInput, setCountryCodeInput] = useState(initialCountryCode);
  const [mobileInput, setMobileInput] = useState(initialMobile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [otpSentFor, setOtpSentFor] = useState<"email" | "mobile" | null>(null);
  const [otpInput, setOtpInput] = useState("");

  const handleUpdateMobile = async () => {
    setIsSubmitting(true);
    const fullMobile = mobileInput.trim() ? `${countryCodeInput}${mobileInput.trim()}` : "";
    const res = await updateMobileNumber(fullMobile);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success);
      setIsEditingMobile(false);
    }
    setIsSubmitting(false);
  };

  const handleSendOtp = async (type: "email" | "mobile") => {
    setIsSubmitting(true);
    const res = await sendVerificationOtp(type);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success);
      setOtpSentFor(type);
    }
    setIsSubmitting(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpSentFor) return;
    setIsSubmitting(true);
    const res = await verifyOtp(otpSentFor, otpInput);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success);
      setOtpSentFor(null);
    }
    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        border: "1px solid var(--glass-border)",
        borderRadius: "12px",
        padding: "1.5rem",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "1rem" }}>
        Contact Details & Verification
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Email Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Email Address</div>
            <div style={{ fontSize: "1rem", color: "var(--color-text-primary)", fontWeight: 500 }}>{email}</div>
          </div>
          <div>
            {emailVerified ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Verified
              </span>
            ) : (
              <button onClick={() => handleSendOtp("email")} disabled={isSubmitting} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                Verify Email
              </button>
            )}
          </div>
        </div>

        {/* Mobile Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Mobile Number</div>
            {isEditingMobile ? (
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                <select
                  value={countryCodeInput}
                  onChange={(e) => setCountryCodeInput(e.target.value)}
                  className="form-input"
                  style={{ width: "90px", padding: "0 0.5rem", flexShrink: 0 }}
                >
                  <option value="+1">+1 (US/CA)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (IN)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+49">+49 (DE)</option>
                  <option value="+86">+86 (CN)</option>
                  <option value="+81">+81 (JP)</option>
                </select>
                <input 
                  type="tel" 
                  value={mobileInput} 
                  onChange={(e) => setMobileInput(e.target.value)} 
                  placeholder="1234567890"
                  className="form-input"
                  style={{ width: "150px", padding: "0.4rem 0.75rem", fontSize: "0.9rem" }}
                />
                <button onClick={handleUpdateMobile} disabled={isSubmitting} className="btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Save</button>
                <button onClick={() => { setIsEditingMobile(false); setMobileInput(initialMobile); setCountryCodeInput(initialCountryCode); }} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ fontSize: "1rem", color: mobile ? "var(--color-text-primary)" : "var(--color-text-muted)", fontWeight: mobile ? 500 : 400 }}>
                  {mobile || "No mobile number added"}
                </div>
                <button onClick={() => setIsEditingMobile(true)} style={{ background: "none", border: "none", color: "var(--color-primary-light)", cursor: "pointer", fontSize: "0.8rem", padding: "0.2rem" }}>
                  Edit
                </button>
              </div>
            )}
          </div>
          
          {!isEditingMobile && mobile && (
            <div>
              {mobileVerified ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.75rem", background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Verified
                </span>
              ) : (
                <button onClick={() => handleSendOtp("mobile")} disabled={isSubmitting} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                  Verify Mobile
                </button>
              )}
            </div>
          )}
        </div>

        {/* OTP Input Modal/Area */}
        {otpSentFor && (
          <div style={{ marginTop: "1rem", padding: "1.25rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
            <h4 style={{ margin: "0 0 0.5rem", color: "var(--color-text-primary)" }}>
              Enter Verification Code
            </h4>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              We sent a 6-digit code to your {otpSentFor}.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="123456"
                className="form-input"
                style={{ width: "150px", letterSpacing: "0.2em", textAlign: "center", fontWeight: 600 }}
              />
              <button onClick={handleVerifyOtp} disabled={isSubmitting || otpInput.length !== 6} className="btn-primary">
                Verify
              </button>
              <button onClick={() => setOtpSentFor(null)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
