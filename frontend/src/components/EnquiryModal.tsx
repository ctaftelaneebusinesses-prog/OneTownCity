"use client";

import React, { useState } from "react";
import { X, CheckCircle, AlertCircle, Send } from "lucide-react";

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
      }, 2000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error submitting enquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#C3CDD6] pb-3">
          <div>
            <div className="font-mono text-[10px] text-[#EAAA00] uppercase tracking-widest font-bold">
              Direct Lead Capture
            </div>
            <h3 className="font-mono text-base font-bold text-[#3A0F34]">
              {listing.vertical === "education" ? "Course & Admission Request" : "Customer Enquiry"}
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
                Your Full Name *
              </label>
              <input
                type="text"
                value={inquirerName}
                onChange={(e) => setInquirerName(e.target.value)}
                placeholder="e.g. Ramesh Varma"
                className="w-full rounded border border-[#C3CDD6] bg-[#DDE3E8]/30 px-3 py-2 font-mono text-xs text-[#1E081B] placeholder-[#5E4B5B] outline-none focus:border-[#3A0F34]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-xs text-[#5E4B5B] uppercase font-bold mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={inquirerPhone}
                  onChange={(e) => setInquirerPhone(e.target.value)}
                  placeholder="+91-9876543210"
                  className="w-full rounded border border-[#C3CDD6] bg-[#DDE3E8]/30 px-3 py-2 font-mono text-xs text-[#1E081B] placeholder-[#5E4B5B] outline-none focus:border-[#3A0F34]"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-[#5E4B5B] uppercase font-bold mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={inquirerEmail}
                  onChange={(e) => setInquirerEmail(e.target.value)}
                  placeholder="ramesh@gmail.com"
                  className="w-full rounded border border-[#C3CDD6] bg-[#DDE3E8]/30 px-3 py-2 font-mono text-xs text-[#1E081B] placeholder-[#5E4B5B] outline-none focus:border-[#3A0F34]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-[#5E4B5B] uppercase font-bold mb-1">
                Enquiry Category
              </label>
              <select
                value={enquiryType}
                onChange={(e) =>
                  setEnquiryType(e.target.value as "admission" | "course_fee" | "general_availability")
                }
                className="w-full rounded border border-[#C3CDD6] bg-[#DDE3E8]/30 px-3 py-2 font-mono text-xs text-[#1E081B] outline-none focus:border-[#3A0F34]"
              >
                {listing.vertical === "education" ? (
                  <>
                    <option value="admission">Direct Admission Request</option>
                    <option value="course_fee">Course Fee & Schedule Query</option>
                    <option value="general_availability">Campus Facilities / Hostel Availability</option>
                  </>
                ) : (
                  <>
                    <option value="general_availability">Product / Service Availability</option>
                    <option value="course_fee">Pricing & Discount Inquiry</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-[#5E4B5B] uppercase font-bold mb-1">
                Message & Specific Requirements *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Mention specific course, seats, requirements, or timing..."
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
                className="flex items-center gap-1.5 rounded bg-[#3A0F34] px-4 py-2 font-mono text-xs font-bold uppercase text-[#F8FAFC] hover:bg-[#240820] shadow-xs disabled:opacity-50 transition-colors"
              >
                <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>{isSubmitting ? "Sending..." : "Submit Lead"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
