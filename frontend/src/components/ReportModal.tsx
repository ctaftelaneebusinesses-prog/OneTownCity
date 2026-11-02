"use client";

import React, { useState } from "react";
import { X, CheckCircle, AlertCircle, Flag } from "lucide-react";

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    name: string;
  } | null;
  apiUrl?: string;
};

export function ReportModal({
  isOpen,
  onClose,
  listing,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1",
}: ReportModalProps) {
  const [reportedByEmail, setReportedByEmail] = useState("");
  const [reason, setReason] = useState<"incorrect_details" | "closed_business" | "duplicate" | "misleading">("incorrect_details");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details) {
      setErrorMsg("Please provide specifics regarding the report.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${apiUrl}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          reported_by_email: reportedByEmail || undefined,
          reason,
          details,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit issue report");
      }

      setSuccessMsg("Report submitted for City Admin review.");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1800);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error submitting report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "6px",
    border: "1px solid #D8D3C8",
    backgroundColor: "#FFFFFF",
    padding: "8px 12px",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "#111110",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#575551",
    marginBottom: "6px",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-overlay-enter"
      style={{ backgroundColor: "rgba(17,17,16,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md animate-modal-enter"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D8D3C8",
          borderRadius: "10px",
          padding: "24px",
        }}
      >
        <div
          className="flex items-center justify-between pb-3.5"
          style={{ borderBottom: "1px solid #D8D3C8", marginBottom: "16px" }}
        >
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4" style={{ color: "#FF4F17" }} strokeWidth={2} />
            <h3
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 700,
                color: "#111110",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: 0,
              }}
            >
              Report Listing Issue
            </h3>
          </div>
          <button
            onClick={onClose}
            className="pressable"
            style={{
              padding: "4px",
              borderRadius: "4px",
              border: "1px solid #D8D3C8",
              background: "transparent",
              color: "#575551",
              cursor: "pointer",
            }}
            title="Close dialog"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#575551", marginBottom: "16px" }}>
          Target: <strong style={{ color: "#111110" }}>{listing.name}</strong>
        </div>

        {successMsg ? (
          <div
            className="animate-modal-enter"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px",
              border: "1px solid rgba(13,104,71,0.25)",
              borderRadius: "6px",
              backgroundColor: "#ECFDF5",
              color: "#0D6847",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <CheckCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {errorMsg && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px",
                  border: "1px solid rgba(255,79,23,0.3)",
                  borderRadius: "6px",
                  backgroundColor: "rgba(255,79,23,0.06)",
                  color: "#D93A08",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label style={labelStyle}>Reason for Report *</label>
              <select
                value={reason}
                onChange={(e) =>
                  setReason(
                    e.target.value as "incorrect_details" | "closed_business" | "duplicate" | "misleading"
                  )
                }
                style={inputStyle}
              >
                <option value="incorrect_details">Incorrect phone, address, or courses</option>
                <option value="closed_business">Entity permanently closed / moved</option>
                <option value="duplicate">Duplicate listing entry</option>
                <option value="misleading">Misleading claim or unverified admission fee</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Your Email (Optional)</label>
              <input
                type="email"
                value={reportedByEmail}
                onChange={(e) => setReportedByEmail(e.target.value)}
                placeholder="verifier@gmail.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Details &amp; Evidence *</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what information needs correction..."
                required
                style={{ ...inputStyle, resize: "none", fontFamily: "var(--font-sans)", fontSize: "13px" }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "10px",
                paddingTop: "14px",
                borderTop: "1px solid #D8D3C8",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="pressable"
                style={{
                  padding: "8px 16px",
                  border: "1px solid #D8D3C8",
                  borderRadius: "6px",
                  background: "#EAE6DF",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "#575551",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="pressable"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 18px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#FF4F17",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                <Flag className="h-3.5 w-3.5" strokeWidth={2} />
                <span>{isSubmitting ? "Submitting..." : "Submit Report"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
