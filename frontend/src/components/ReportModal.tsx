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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-neutral-400" />
            <h3 className="font-mono text-sm font-bold text-neutral-100 uppercase">
              Report Listing Issue
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-3 font-mono text-xs text-neutral-300">
          Target: <span className="font-semibold text-white">{listing.name}</span>
        </div>

        {successMsg ? (
          <div className="my-6 flex items-center gap-2 rounded border border-neutral-700 bg-neutral-900 p-4 font-mono text-xs text-neutral-200">
            <CheckCircle className="h-4 w-4 text-white" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded border border-red-900/60 bg-red-950/40 p-2 font-mono text-xs text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-mono text-xs text-neutral-400 uppercase mb-1">
                Your Email (Optional)
              </label>
              <input
                type="email"
                value={reportedByEmail}
                onChange={(e) => setReportedByEmail(e.target.value)}
                placeholder="citizen@onetowncity.local"
                className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-neutral-400 uppercase mb-1">
                Reason for Report *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as "incorrect_details" | "closed_business" | "duplicate" | "misleading")}
                className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-100 outline-none focus:border-neutral-500"
              >
                <option value="incorrect_details">Incorrect Address / Phone Number</option>
                <option value="closed_business">Permanently Closed or Relocated</option>
                <option value="duplicate">Duplicate Entry</option>
                <option value="misleading">Misleading or Fraudulent Information</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-neutral-400 uppercase mb-1">
                Clarification Details *
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Explain the inaccuracy or provide updated details..."
                className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-neutral-800 px-4 py-2 font-mono text-xs uppercase text-neutral-400 hover:bg-neutral-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded bg-neutral-100 px-4 py-2 font-mono text-xs font-bold uppercase text-neutral-950 hover:bg-white disabled:opacity-50"
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
