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
  apiUrl: string;
};

export function ReportModal({ isOpen, onClose, listing, apiUrl }: ReportModalProps) {
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
      }, 2000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error submitting report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#C3CDD6] pb-3">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-[#B93829]" strokeWidth={2} />
            <h3 className="font-mono text-sm font-bold text-[#3A0F34] uppercase tracking-wide">
              Report Listing Issue
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#5E4B5B] hover:bg-[#DDE3E8] hover:text-[#1E081B] transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="my-3 font-mono text-xs text-[#5E4B5B]">
          Target: <span className="font-bold text-[#1E081B]">{listing.name}</span>
        </div>

        {successMsg ? (
          <div className="my-6 flex items-center gap-2 rounded-lg border border-[#0D6E52] bg-[#0D6E52]/10 p-4 font-mono text-xs text-[#0D6E52] font-semibold">
            <CheckCircle className="h-4 w-4 text-[#0D6E52]" strokeWidth={2} />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-[#B93829] bg-[#B93829]/10 p-2.5 font-mono text-xs text-[#B93829]">
                <AlertCircle className="h-4 w-4 text-[#B93829]" strokeWidth={2} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-mono text-xs text-[#5E4B5B] uppercase font-bold mb-1">
                Your Email (Optional)
              </label>
              <input
                type="email"
                value={reportedByEmail}
                onChange={(e) => setReportedByEmail(e.target.value)}
                placeholder="citizen@onetowncity.local"
                className="w-full rounded border border-[#C3CDD6] bg-[#DDE3E8]/30 px-3 py-2 font-mono text-xs text-[#1E081B] placeholder-[#5E4B5B] outline-none focus:border-[#3A0F34]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#5E4B5B] uppercase font-bold mb-1">
                Reason for Report *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as "incorrect_details" | "closed_business" | "duplicate" | "misleading")}
                className="w-full rounded border border-[#C3CDD6] bg-[#DDE3E8]/30 px-3 py-2 font-mono text-xs text-[#1E081B] outline-none focus:border-[#3A0F34]"
              >
                <option value="incorrect_details">Incorrect Address / Phone Number</option>
                <option value="closed_business">Permanently Closed or Relocated</option>
                <option value="duplicate">Duplicate Entry</option>
                <option value="misleading">Misleading or Fraudulent Information</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-[#5E4B5B] uppercase font-bold mb-1">
                Clarification Details *
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Explain the inaccuracy or provide updated details..."
                className="w-full rounded border border-[#C3CDD6] bg-[#DDE3E8]/30 px-3 py-2 font-mono text-xs text-[#1E081B] placeholder-[#5E4B5B] outline-none focus:border-[#3A0F34]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#C3CDD6]">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-[#C3CDD6] px-4 py-2 font-mono text-xs uppercase font-semibold text-[#5E4B5B] hover:bg-[#DDE3E8] hover:text-[#1E081B] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded bg-[#3A0F34] px-4 py-2 font-mono text-xs font-bold uppercase text-[#F8FAFC] hover:bg-[#240820] shadow-xs disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
