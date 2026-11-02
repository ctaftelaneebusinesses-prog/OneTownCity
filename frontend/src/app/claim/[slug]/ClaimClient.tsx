"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Building,
  GraduationCap,
  CheckCircle2,
  Lock,
  MessageSquare,
  Sparkles,
  Clock,
  ExternalLink,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

export type ListingSummary = {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  city: string;
  address: string;
  phone: string;
  verification_status: "not_verified" | "owner_claimed" | "details_reviewed";
};

interface ClaimClientProps {
  listing: ListingSummary;
}

export function ClaimClient({ listing }: ClaimClientProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submittedClaimId, setSubmittedClaimId] = useState<string | null>(null);

  const [form, setForm] = useState({
    organization_name: listing.name,
    official_email: user?.email || "",
    official_phone: listing.phone || "",
    verification_evidence: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.official_email.trim() || !form.official_phone.trim() || !form.verification_evidence.trim()) {
      toast.error("Please provide official email, telephone, and verification evidence.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          listing_id: listing.id,
          organization_name: form.organization_name.trim(),
          official_email: form.official_email.trim(),
          official_phone: form.official_phone.trim(),
          verification_evidence: form.verification_evidence.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Claim submission failed");
      }

      setSubmittedClaimId(data.claim_id);
      toast.success("Ownership claim submitted for review");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error submitting claim");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Back Link */}
        <div className="pb-6 mb-6 border-b border-[var(--border-grid)]">
          <Link
            href={`/listings/${listing.slug}`}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {listing.name} Profile</span>
          </Link>
        </div>

        {/* Target Profile Card */}
        <div className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)] text-[var(--ink-secondary)]">
                  {listing.vertical === "education" ? "Education Institution" : "Local Business"}
                </span>
                <span className="font-mono text-[10px] text-[var(--ink-secondary)]">
                  {listing.city}
                </span>
                <span className="font-mono text-[10px] font-semibold text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-300">
                  {listing.verification_status.replace("_", " ").toUpperCase()}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--ink-primary)]">
                {listing.name}
              </h1>
              <p className="font-mono text-xs text-[var(--ink-secondary)] mt-1">
                {listing.address}
              </p>
            </div>

            <div className="font-mono text-xs text-[var(--ink-secondary)] shrink-0 sm:text-right">
              <span className="block text-[10px] uppercase text-[var(--ink-secondary)]">Listing ID</span>
              <span className="font-semibold text-[var(--ink-primary)]">{listing.id.slice(0, 13)}...</span>
            </div>
          </div>
        </div>

        {/* What OWNER CLAIMED Unlocks */}
        <div className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-4">
            <Sparkles className="w-4 h-4 text-[var(--accent-signal)]" />
            <span>What Claiming This Profile Unlocks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[var(--ink-primary)] mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                <span>Actionable Lead Inbox</span>
              </div>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                Respond directly to prospective students, course applicants, and local customer enquiries from your SaaS Studio dashboard.
              </p>
            </div>

            <div className="p-4 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[var(--ink-primary)] mb-1">
                <Tag className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                <span>Publish Student Offers</span>
              </div>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                Post dated student discounts, campus drives, and local promotions that appear on the Town Index and Student Corner.
              </p>
            </div>

            <div className="p-4 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[var(--ink-primary)] mb-1">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                <span>Catalog & Hours Management</span>
              </div>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                Keep official operating schedules, admission deadlines, course fees, and facility lists accurate and fresh.
              </p>
            </div>

            <div className="p-4 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-emerald-800 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Owner Trust Badge</span>
              </div>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                Earn the high-contrast <span className="font-mono text-[11px] font-semibold text-emerald-900">OWNER CLAIMED</span> seal on your public profile.
              </p>
            </div>
          </div>
        </div>

        {/* Claim Form or Success State */}
        {submittedClaimId ? (
          <div className="rounded-lg border-2 border-emerald-700/40 bg-emerald-950/10 p-8 text-center shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-800 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-medium text-emerald-950 mb-2">
              Ownership Claim Submitted for Administrative Review
            </h2>
            <p className="font-mono text-xs text-emerald-900 max-w-xl mx-auto leading-relaxed mb-4">
              Your claim reference is <span className="font-bold underline">{submittedClaimId}</span>. The City Admin governance desk will audit your verification evidence and official telephone/email against municipal records within 24 hours.
            </p>
            <p className="text-xs text-[var(--ink-secondary)] max-w-lg mx-auto mb-6">
              Upon approval, your account will be linked as the Tenant Owner of this organization, granting access to the SaaS Studio Lead Inbox.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded bg-[var(--ink-primary)] text-white font-mono text-xs font-semibold uppercase tracking-wider"
              >
                Go to SaaS Studio
              </Link>
              <Link
                href="/"
                className="px-5 py-2.5 rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ink-primary)]"
              >
                Back to Index
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--border-grid)]">
              <Lock className="w-4 h-4 text-[var(--accent-signal)]" />
              <h2 className="font-serif text-xl font-medium text-[var(--ink-primary)]">
                Submit Institutional Claim & Evidence
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                  Official Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.organization_name}
                  onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
                  className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-sans text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                    Official / Domain Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. principal@narayana.edu.in"
                    value={form.official_email}
                    onChange={(e) => setForm({ ...form, official_email: e.target.value })}
                    className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-mono text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                  />
                  <span className="font-mono text-[10px] text-[var(--ink-secondary)] mt-1 block">
                    Institutional or domain email addresses receive expedited approval.
                  </span>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                    Authorized Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 861 2345678"
                    value={form.official_phone}
                    onChange={(e) => setForm({ ...form, official_phone: e.target.value })}
                    className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-mono text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                  />
                  <span className="font-mono text-[10px] text-[var(--ink-secondary)] mt-1 block">
                    City Admin may place a verification call to confirm identity.
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                  Verification Evidence & Credentials *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide registration number, affiliation certificate URL, GSTIN, business license details, or links to official government directories confirming ownership."
                  value={form.verification_evidence}
                  onChange={(e) => setForm({ ...form, verification_evidence: e.target.value })}
                  className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-sans text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                />
              </div>

              <div className="p-4 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--ink-secondary)] font-mono leading-relaxed">
                  Notice: Fraudulent profile claims or misrepresenting administrative authority violates OneTownCity Civic Standards. Falsified claims result in permanent IP and account suspension.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded bg-[var(--accent-signal)] text-white font-mono text-xs font-semibold uppercase tracking-wider hover:bg-[#e03f0b] transition-all disabled:opacity-50"
              >
                {submitting ? "Submitting Ownership Claim..." : "Submit Claim for Administrative Review"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
