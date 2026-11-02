"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Phone,
  ExternalLink,
  Award,
  GraduationCap,
  Building,
  Flag,
  Share2,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { ReportModal } from "@/components/ReportModal";

export type StudentOpportunity = {
  id: string;
  tenant_id: string | null;
  city: string;
  opportunity_type: "internship" | "scholarship" | "admission_drive" | "hostel" | "student_discount";
  title: string;
  slug: string;
  provider_name: string;
  description: string;
  eligibility: string;
  deadline: string | null;
  apply_url: string;
  contact_phone: string;
  discount_percent: number | null;
  stipend_amount: string | null;
  moderation_status: string;
  anti_scam_acknowledged: boolean;
  created_at: string;
  updated_at: string;
};

export type OpportunityParentOrg = {
  id: string;
  name: string;
  slug: string;
  verification_status: "not_verified" | "owner_claimed" | "details_reviewed";
  city: string;
  address: string;
  phone: string;
  email: string;
};

interface StudentOpportunityClientProps {
  opportunity: StudentOpportunity;
  organization?: OpportunityParentOrg | null;
}

export function StudentOpportunityClient({
  opportunity,
  organization,
}: StudentOpportunityClientProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Opportunity link copied to clipboard");
    } catch {
      toast.error("Unable to copy link to clipboard");
    }
  };

  // Calculate days remaining
  const calculateDaysLeft = (deadlineDate: string | null) => {
    if (!deadlineDate) return null;
    const diff = new Date(deadlineDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysLeft = calculateDaysLeft(opportunity.deadline);

  const typeLabels: Record<string, string> = {
    internship: "Internship Opportunity",
    scholarship: "Scholarship & Aid",
    admission_drive: "Campus Admission Drive",
    hostel: "Verified Student Hostel",
    student_discount: "Student Discount Pass",
  };

  const formattedDeadline = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Open Rolling Application";

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[var(--border-grid)]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Student Corner</span>
          </Link>

          <button
            onClick={handleCopyShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] font-mono text-xs text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--ink-primary)] transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share Opportunity</span>
          </button>
        </div>

        {/* Consumer Protection Anti-Scam Seal */}
        <div className="rounded-lg border-2 border-emerald-700/40 bg-emerald-950/10 p-5 mb-8 shadow-sm">
          <div className="flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-900">
                  CONSUMER PROTECTION NOTICE — NEVER PAY MONEY TO APPLY
                </span>
                <span className="font-mono text-[10px] bg-emerald-800 text-white px-2 py-0.5 rounded font-semibold uppercase">
                  Zero Fee Verified
                </span>
              </div>
              <p className="text-xs text-emerald-950/90 leading-relaxed font-sans">
                Legitimate internships, campus drives, scholarships, and verified student housing never demand application fees, processing charges, or deposits via UPI/cash. If any representative requests payment to apply, flag this listing immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Opportunity Dossier Card */}
        <article className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] p-6 sm:p-8 mb-8 shadow-sm">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)] text-[var(--ink-primary)]">
              {typeLabels[opportunity.opportunity_type] || opportunity.opportunity_type}
            </span>

            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded border border-[var(--border-grid)] text-[var(--ink-secondary)]">
              {opportunity.city}
            </span>

            {organization && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded border border-emerald-700/30 bg-emerald-950/10 text-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>
                  {organization.verification_status === "owner_claimed" ? "Owner Claimed Provider" : "Details Reviewed"}
                </span>
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[var(--ink-primary)] leading-[1.15] mb-2">
            {opportunity.title}
          </h1>

          <div className="flex items-center gap-2 font-mono text-xs text-[var(--ink-secondary)] mb-6">
            <span>Posted by:</span>
            <span className="font-semibold text-[var(--ink-primary)]">{opportunity.provider_name}</span>
          </div>

          {/* Structured Specification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/50 mb-8">
            {/* Financial Benefit / Stipend */}
            <div>
              <span className="font-mono text-[10px] uppercase text-[var(--ink-secondary)] block mb-1">
                Stipend / Value
              </span>
              <span className="font-mono text-lg font-bold text-[var(--accent-signal)]">
                {opportunity.stipend_amount ||
                  (opportunity.discount_percent ? `${opportunity.discount_percent}% Student Discount` : "Zero Fee / Honorarium")}
              </span>
            </div>

            {/* Application Deadline */}
            <div>
              <span className="font-mono text-[10px] uppercase text-[var(--ink-secondary)] block mb-1">
                Application Deadline
              </span>
              <span className="font-mono text-sm font-semibold text-[var(--ink-primary)] block">
                {formattedDeadline}
              </span>
              {daysLeft !== null && (
                <span className={`font-mono text-[10px] font-semibold ${daysLeft <= 5 ? "text-[var(--accent-signal)]" : "text-emerald-700"}`}>
                  {daysLeft > 0 ? `${daysLeft} days remaining` : "Deadline passed"}
                </span>
              )}
            </div>

            {/* Verification & Trust */}
            <div>
              <span className="font-mono text-[10px] uppercase text-[var(--ink-secondary)] block mb-1">
                Trust Protocol
              </span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Zero Application Fee</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="font-serif text-xl font-medium text-[var(--ink-primary)] mb-3">
              Program Scope & Details
            </h2>
            <div className="text-[var(--ink-primary)] text-base leading-relaxed whitespace-pre-line font-sans">
              {opportunity.description}
            </div>
          </div>

          {/* Eligibility Matrix */}
          {opportunity.eligibility && (
            <div className="mb-8 p-5 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/30">
              <h2 className="font-serif text-xl font-medium text-[var(--ink-primary)] mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[var(--accent-signal)]" />
                <span>Eligibility Requirements</span>
              </h2>
              <div className="text-sm text-[var(--ink-primary)] leading-relaxed whitespace-pre-line font-sans">
                {opportunity.eligibility}
              </div>
            </div>
          )}

          {/* Parent Institution Card (if linked) */}
          {organization && (
            <div className="mb-8 p-5 rounded border border-[var(--border-grid)] bg-[var(--bg-surface)]">
              <span className="font-mono text-[10px] uppercase text-[var(--ink-secondary)] block mb-2">
                Issuing Verified Institution
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg font-medium text-[var(--ink-primary)]">
                    {organization.name}
                  </h3>
                  <p className="font-mono text-xs text-[var(--ink-secondary)] mt-0.5">
                    {organization.address}, {organization.city}
                  </p>
                </div>
                <Link
                  href={`/listings/${organization.slug}`}
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--accent-signal)] hover:underline shrink-0"
                >
                  <span>View Institution Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-6 border-t border-[var(--border-grid)] flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {opportunity.apply_url && (
              <a
                href={opportunity.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded bg-[var(--accent-signal)] text-white font-mono text-xs font-semibold uppercase tracking-wider hover:bg-[#e03f0b] transition-all shadow-sm"
              >
                <span>Direct Application Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {opportunity.contact_phone && (
              <a
                href={`tel:${opportunity.contact_phone}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ink-primary)] hover:border-[var(--ink-primary)] transition-all"
              >
                <Phone className="w-4 h-4 text-[var(--ink-secondary)]" />
                <span>Call Program Desk ({opportunity.contact_phone})</span>
              </a>
            )}

            <button
              onClick={() => setIsReportOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)] font-mono text-xs text-[var(--ink-secondary)] hover:text-[var(--accent-signal)] hover:border-[var(--accent-signal)] transition-colors"
              title="Report suspicious or fraudulent listing"
            >
              <Flag className="w-4 h-4" />
              <span className="hidden lg:inline">Report Fee Demand</span>
            </button>
          </div>
        </article>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        listing={{ id: opportunity.id, name: opportunity.title }}
      />
    </div>
  );
}
