"use client";

import React, { useState } from "react";
import { X, CheckCircle, Send } from "lucide-react";

type EnquiryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    name: string;
    vertical: string;
  } | null;
  apiUrl: string;
};

export function EnquiryModal({ isOpen, onClose, listing, apiUrl }: EnquiryModalProps) {
  const [inquirerName, setInquirerName] = useState("");
  const [inquirerPhone, setInquirerPhone] = useState("");
  const [inquirerEmail, setInquirerEmail] = useState("");
  const [enquiryType, setEnquiryType] = useState<"admission" | "course_fee" | "general_availability">(
    listing?.vertical === "education" ? "admission" : "general_availability"
  );
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirerName || !inquirerPhone || !message) {
      setErrorMsg("Name, contact number, and message are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${apiUrl}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listing.id,
          inquirer_name: inquirerName,
          inquirer_phone: inquirerPhone,
          inquirer_email: inquirerEmail || undefined,
          enquiry_type: enquiryType,
          message,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to submit enquiry");
      }

      setSuccessMsg("Enquiry registered and dispatched to institution lead inbox.");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1800);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error submitting enquiry");
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
        className="w-full max-w-lg animate-modal-enter"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D8D3C8",
          borderRadius: "10px",
          padding: "28px",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pb-4"
          style={{ borderBottom: "1px solid #D8D3C8", marginBottom: "20px" }}
        >
          <div>
            <h3
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                fontWeight: 700,
                color: "#111110",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {listing.vertical === "education" ? "Admission Enquiry" : "Customer Enquiry"}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "#8B877F",
                margin: "4px 0 0",
              }}
            >
              {listing.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="pressable"
            aria-label="Close dialog"
            style={{
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid #D8D3C8",
              background: "transparent",
              color: "#575551",
              cursor: "pointer",
            }}
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {successMsg ? (
          <div
            className="animate-modal-enter"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "16px",
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
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {errorMsg && (
              <div
                style={{
                  padding: "10px 12px",
                  border: "1px solid rgba(255,79,23,0.3)",
                  borderRadius: "6px",
                  backgroundColor: "rgba(255,79,23,0.06)",
                  color: "#D93A08",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                }}
              >
                {errorMsg}
              </div>
            )}

            <div>
              <label style={labelStyle}>Your Full Name *</label>
              <input
                type="text"
                value={inquirerName}
                onChange={(e) => setInquirerName(e.target.value)}
                placeholder="e.g. Ramesh Varma"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input
                  type="tel"
                  value={inquirerPhone}
                  onChange={(e) => setInquirerPhone(e.target.value)}
                  placeholder="+91-9876543210"
                  required
                  style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Email (Optional)</label>
                <input
                  type="email"
                  value={inquirerEmail}
                  onChange={(e) => setInquirerEmail(e.target.value)}
                  placeholder="ramesh@gmail.com"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Enquiry Category</label>
              <select
                value={enquiryType}
                onChange={(e) =>
                  setEnquiryType(e.target.value as "admission" | "course_fee" | "general_availability")
                }
                style={inputStyle}
              >
                {listing.vertical === "education" ? (
                  <>
                    <option value="admission">Admissions &amp; Eligibility Criteria</option>
                    <option value="course_fee">Course Fees &amp; Scholarship Structure</option>
                    <option value="general_availability">Campus Visit &amp; Hostel Enquiry</option>
                  </>
                ) : (
                  <>
                    <option value="general_availability">Product / Service Availability</option>
                    <option value="course_fee">Price Quote / Student Offer Verification</option>
                    <option value="admission">Operating Hours &amp; Booking Details</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Message &amp; Specific Requirements *</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mention specific course, seats, requirements, or timing..."
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
                paddingTop: "16px",
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
                  padding: "8px 20px",
                  border: "none",
                  borderRadius: "6px",
                  background: isSubmitting ? "#575551" : "#FF4F17",
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
                <Send className="h-3.5 w-3.5" strokeWidth={2} />
                <span>{isSubmitting ? "Submitting..." : "Submit Enquiry"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
