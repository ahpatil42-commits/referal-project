"use client";

import { useState } from "react";
import { updateReferrerProfile } from "@/actions/referrer";
import { updateAtsSettings } from "@/actions/ats";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ReferrerSettings({ 
  maxReferrals, 
  atsProvider 
}: { 
  maxReferrals: number;
  atsProvider: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState(maxReferrals);
  
  const [atsLoading, setAtsLoading] = useState(false);
  const [provider, setProvider] = useState(atsProvider || "GREENHOUSE");
  const [apiKey, setApiKey] = useState("");

  const handleSaveQuota = async () => {
    setLoading(true);
    const res = await updateReferrerProfile({ maxReferrals: quota });
    if (res.error) toast.error(res.error);
    if (res.success) toast.success("Referral quota updated!");
    setLoading(false);
  };

  const handleSaveAts = async () => {
    if (!apiKey) {
      toast.error("Please enter an API Key");
      return;
    }
    setAtsLoading(true);
    const res = await updateAtsSettings({ atsProvider: provider, atsApiKey: apiKey });
    if (res.error) toast.error(res.error);
    if (res.success) {
      toast.success(res.success);
      setApiKey(""); // Clear it after saving for security
    }
    setAtsLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Quota Settings */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Referral Quota</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Set the maximum number of referral requests you are willing to accept per month.
        </p>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <input 
            type="number" 
            min="1" 
            max="20" 
            value={quota} 
            onChange={(e) => setQuota(parseInt(e.target.value) || 1)}
            style={{ 
              width: "80px", 
              background: "var(--glass-bg)", 
              border: "1px solid var(--glass-border)", 
              padding: "0.5rem", 
              borderRadius: "6px",
              color: "white"
            }} 
          />
          <button 
            onClick={handleSaveQuota} 
            disabled={loading || quota === maxReferrals}
            className="btn-primary"
            style={{ padding: "0.5rem 1rem" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Save Quota"}
          </button>
        </div>
      </div>

      {/* ATS Settings */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>ATS Integration</h2>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Securely connect your Applicant Tracking System to auto-push accepted candidates.
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>Provider</label>
            <select 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)}
              style={{ 
                width: "100%", 
                background: "var(--glass-bg)", 
                border: "1px solid var(--glass-border)", 
                padding: "0.5rem", 
                borderRadius: "6px",
                color: "white"
              }}
            >
              <option value="GREENHOUSE">Greenhouse Harvest</option>
              <option value="LEVER">Lever</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>API Key</label>
            <input 
              type="password" 
              placeholder="Enter new ATS API Key"
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              style={{ 
                width: "100%", 
                background: "var(--glass-bg)", 
                border: "1px solid var(--glass-border)", 
                padding: "0.5rem", 
                borderRadius: "6px",
                color: "white"
              }} 
            />
            {atsProvider && !apiKey && (
              <p style={{ fontSize: "0.75rem", color: "var(--color-success)", marginTop: "0.25rem" }}>✓ Key is currently set (Hidden for security)</p>
            )}
          </div>

          <button 
            onClick={handleSaveAts} 
            disabled={atsLoading || !apiKey}
            className="btn-primary"
            style={{ padding: "0.5rem 1rem", marginTop: "0.5rem" }}
          >
            {atsLoading ? <Loader2 size={16} className="animate-spin" /> : "Save ATS Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
