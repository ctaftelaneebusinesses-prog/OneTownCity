import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  FileCheck,
  Lock,
  Users,
  Eye,
  Flag,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trust, Governance & Verification Handbook | OneTownCity",
  description:
    "Official verification methodology, governance role hierarchy, consumer privacy policies, and dispute resolution protocol for OneTownCity.",
};

export default function TrustHandbookPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] font-mono text-xs uppercase tracking-wider text-[var(--accent-signal)] mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Civic Integrity & Standards</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[var(--ink-primary)] leading-[1.1] mb-4">
            Trust, Governance & Privacy Handbook
          </h1>
          <p className="text-[var(--ink-secondary)] text-base sm:text-lg leading-relaxed">
            OneTownCity operates under strict civic governance rules to prevent spam, fraud, and unverified directory bloat. Every listing, claim, and town notice is governed by this charter.
          </p>
        </div>

        {/* SECTION 1: VERIFICATION BADGES & AUDIT METHODOLOGY */}
        <section className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] p-6 sm:p-8 mb-12 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-6 pb-3 border-b border-[var(--border-grid)]">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Section 01 / Verification Badges & Audit Criteria</span>
          </div>

          <div className="space-y-6">
            {/* DETAILS REVIEWED */}
            <div className="p-5 rounded border border-emerald-700/30 bg-emerald-950/10">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-800 text-white">
                    DETAILS REVIEWED
                  </span>
                  <span className="font-mono text-xs font-semibold text-emerald-950">
                    Administrative Fact-Check Completed
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-900 uppercase">
                  Verified by City Admin
                </span>
              </div>
              <p className="text-xs text-emerald-950/90 leading-relaxed font-sans mb-3">
                Assigned when our City Admin desk has verified the institution’s physical premises, checked that telephone contacts are answered, and cross-referenced official university affiliations or municipal business licenses.
              </p>
              <div className="font-mono text-[11px] text-emerald-900/80">
                Audit Checklist: Physical address verification • Active phone check • Valid course catalog or commercial storefront.
              </div>
            </div>

            {/* OWNER CLAIMED */}
            <div className="p-5 rounded border border-blue-700/30 bg-blue-950/10">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-800 text-white">
                    OWNER CLAIMED
                  </span>
                  <span className="font-mono text-xs font-semibold text-blue-950">
                    Proprietor or Dean Active Management
                  </span>
                </div>
                <span className="font-mono text-[10px] text-blue-900 uppercase">
                  Authenticated Tenant
                </span>
              </div>
              <p className="text-xs text-blue-950/90 leading-relaxed font-sans mb-3">
                Assigned when the authorized dean, academic administrator, or business proprietor has submitted proof of credentials (domain email, registration certificate, or authorization letter) through our claim portal and actively manages the lead inbox.
              </p>
              <div className="font-mono text-[11px] text-blue-900/80">
                Audit Checklist: Authorized claimant email check • Telephone callback verification • Multi-factor login enablement.
              </div>
            </div>

            {/* NOT VERIFIED */}
            <div className="p-5 rounded border border-neutral-300 bg-[var(--bg-muted)]/40">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-neutral-600 text-white">
                    NOT VERIFIED
                  </span>
                  <span className="font-mono text-xs font-semibold text-[var(--ink-primary)]">
                    Community Suggestion or Seed Record
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[var(--ink-secondary)] uppercase">
                  Pending Physical Review
                </span>
              </div>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed font-sans mb-3">
                Indicates a directory listing that was contributed by a resident or imported from local civic archives, but has not yet completed City Admin telephone or on-site fact-checking. Anyone who owns or manages this entity is encouraged to claim it.
              </p>
              <div className="font-mono text-[11px] text-[var(--ink-secondary)]">
                Status Note: All unverified profiles include a prominent <span className="font-semibold text-[var(--ink-primary)]">"Claim This Institution / Business"</span> CTA.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: 4-TIER GOVERNANCE ROLE HIERARCHY */}
        <section className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] p-6 sm:p-8 mb-12 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-6 pb-3 border-b border-[var(--border-grid)]">
            <Users className="w-4 h-4 text-[var(--accent-signal)]" />
            <span>Section 02 / 4-Tier Governance Role Hierarchy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/30">
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--accent-signal)] block mb-1">
                TIER 01 / CENTRAL ADMINISTRATION
              </span>
              <h3 className="font-serif text-xl font-medium text-[var(--ink-primary)] mb-2">
                Super Admin
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mb-3">
                Maintains multi-tenant isolation, database integrity, schema migrations, and immutable audit logs. Super Admins possess system-wide permissions across all towns.
              </p>
              <div className="font-mono text-[11px] text-[var(--ink-primary)] font-semibold">
                Key Powers: Audit log review • Security policy enforcement • Tenant membership transfers.
              </div>
            </div>

            <div className="p-5 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/30">
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--accent-signal)] block mb-1">
                TIER 02 / LOCAL JURISDICTION
              </span>
              <h3 className="font-serif text-xl font-medium text-[var(--ink-primary)] mb-2">
                City Admin (Nellore & Kuppam)
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mb-3">
                Responsible for town-level editorial quality. Approves or rejects community listing suggestions, reviews profile ownership claims, and resolves citizen reports.
              </p>
              <div className="font-mono text-[11px] text-[var(--ink-primary)] font-semibold">
                Key Powers: Moderation queue actioning • Claim approvals • Assigning verification badges.
              </div>
            </div>

            <div className="p-5 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/30">
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--accent-signal)] block mb-1">
                TIER 03 / OPERATIONAL SUPPORT
              </span>
              <h3 className="font-serif text-xl font-medium text-[var(--ink-primary)] mb-2">
                Sub Admin
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mb-3">
                Assists City Admins with high-volume review queues, telephone confirmations, and category request triaging. Cannot alter global SaaS configurations.
              </p>
              <div className="font-mono text-[11px] text-[var(--ink-primary)] font-semibold">
                Key Powers: Initial evidence review • Fact-check research • Queue triage.
              </div>
            </div>

            <div className="p-5 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/30">
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--accent-signal)] block mb-1">
                TIER 04 / ACCREDITED CONTRIBUTORS
              </span>
              <h3 className="font-serif text-xl font-medium text-[var(--ink-primary)] mb-2">
                Content Provider
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed mb-3">
                Student union reps, campus journalists, and accredited local reporters permitted to submit town announcements, civic development notes, and category requests.
              </p>
              <div className="font-mono text-[11px] text-[var(--ink-primary)] font-semibold">
                Key Powers: Expedited news submission • Subcategory recommendations.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PRIVACY & CONTACT PROTECTION STANDARDS */}
        <section className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] p-6 sm:p-8 mb-12 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-6 pb-3 border-b border-[var(--border-grid)]">
            <Lock className="w-4 h-4 text-emerald-800" />
            <span>Section 03 / Data Privacy, Consent & Contact Numbers</span>
          </div>

          <div className="space-y-4 text-xs font-sans leading-relaxed text-[var(--ink-secondary)]">
            <p>
              <strong className="text-[var(--ink-primary)] font-mono text-xs uppercase">Public Commercial Contacts Only:</strong> OneTownCity publishes official business landlines, admission office helplines, and verified WhatsApp customer desk numbers. Personal residential mobile numbers are never listed without documented explicit consent.
            </p>
            <p>
              <strong className="text-[var(--ink-primary)] font-mono text-xs uppercase">Resident Enquiry Confidentiality:</strong> When a prospective student or resident submits an enquiry via our modal, their contact details are routed directly to the verified institution’s tenant inbox. We never broadcast student leads to third-party telemarketing firms or insurance agencies.
            </p>
            <p>
              <strong className="text-[var(--ink-primary)] font-mono text-xs uppercase">Zero-Tracker Policy:</strong> OneTownCity operates without third-party ad-tracking cookies, behavioral surveillance pixels, or fingerprinting scripts. All click telemetry (profile views, WhatsApp click counters) is aggregated strictly for local analytics.
            </p>
          </div>
        </section>

        {/* SECTION 4: CITIZEN ISSUE REPORTING & DISPUTES */}
        <section className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] p-6 sm:p-8 mb-12 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-6 pb-3 border-b border-[var(--border-grid)]">
            <Flag className="w-4 h-4 text-[var(--accent-signal)]" />
            <span>Section 04 / Ownership Disputes & Citizen Reports</span>
          </div>

          <div className="space-y-4 text-xs font-sans leading-relaxed text-[var(--ink-secondary)] mb-6">
            <p>
              Residents and proprietors may flag listings at any time using the <span className="font-mono text-xs font-semibold text-[var(--ink-primary)]">"Report Outdated / Incorrect Details"</span> trigger located on every listing card and detail page.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40 font-mono text-xs">
                <span className="font-bold text-[var(--ink-primary)] block mb-1">closed_business</span>
                Entity has ceased operations or relocated permanently.
              </div>
              <div className="p-3.5 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40 font-mono text-xs">
                <span className="font-bold text-[var(--ink-primary)] block mb-1">incorrect_details</span>
                Wrong telephone number, outdated address, or expired course offerings.
              </div>
              <div className="p-3.5 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40 font-mono text-xs">
                <span className="font-bold text-[var(--ink-primary)] block mb-1">duplicate</span>
                Duplicate profile exists in the OneTownCity directory.
              </div>
              <div className="p-3.5 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40 font-mono text-xs">
                <span className="font-bold text-[var(--ink-primary)] block mb-1">misleading</span>
                Profile contains false claims or fraudulent fee demands for student opportunities.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-grid)] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <span className="text-[var(--ink-secondary)]">
              Have an urgent governance dispute or ownership inquiry?
            </span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 font-semibold text-[var(--accent-signal)] hover:underline"
            >
              <span>View City Admin Governance Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
