import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  ShieldCheck,
  Check,
  X,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Building,
  GraduationCap,
  Tag,
  MessageSquare,
  Lock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SaaS Plans & Entitlements Matrix | OneTownCity",
  description:
    "Transparent pricing and lead entitlements for local colleges, academies, and business storefronts. Verification status can never be bought.",
};

export default function PricingPage() {
  const plans = [
    {
      name: "Free Basic",
      tier: "free",
      target: "Claimed storefronts & local cafes",
      price: "INR 0",
      period: "forever",
      description: "Essential local discovery and basic resident enquiry routing for independent businesses.",
      leadQuota: "10 resident leads / month",
      offerSlots: "1 active student offer",
      analytics: "7-day click telemetry",
      features: [
        "Claimable directory profile",
        "Operating hours & contact links",
        "10 verified resident leads/mo",
        "1 student offer or discount slot",
        "Standard community review",
      ],
      notIncluded: [
        "Sponsored index placements",
        "Multi-staff user seats",
        "CSV lead exports",
        "Direct API telemetry",
      ],
      highlight: false,
      ctaText: "Start Free via Claim",
      ctaHref: "/#directory",
    },
    {
      name: "Growth Business",
      tier: "growth_business",
      target: "Bookstores, study cafes & dining",
      price: "INR 1,499",
      period: "per month",
      description: "Expanded customer lead capacity and active promotional slots for high-traffic retail storefronts.",
      leadQuota: "50 resident leads / month",
      offerSlots: "5 active student offers",
      analytics: "30-day click & call conversion tracking",
      features: [
        "Everything in Free Basic",
        "50 resident leads/mo",
        "5 student discount/offer slots",
        "30-day conversion telemetry",
        "WhatsApp click tracking",
        "Priority moderation queue",
      ],
      notIncluded: [
        "Multi-staff user seats",
        "Direct API telemetry",
      ],
      highlight: false,
      ctaText: "Explore in SaaS Studio",
      ctaHref: "/dashboard",
    },
    {
      name: "Edu Pro",
      tier: "edu_pro",
      target: "Degree colleges & coaching institutes",
      price: "INR 4,999",
      period: "per month",
      description: "Comprehensive admission campaign suite, faculty staff seats, and large student internship quotas.",
      leadQuota: "250 admission leads / month",
      offerSlots: "15 active internships / drives",
      analytics: "90-day lead attribution & CSV export",
      features: [
        "Everything in Growth Business",
        "250 admission enquiries/mo",
        "15 internships & scholarship slots",
        "5 faculty / staff logins",
        "CSV lead downloads",
        "Direct admission enquiry routing",
        "Custom course catalog tabs",
      ],
      notIncluded: [
        "Dedicated civic concierge",
      ],
      highlight: true,
      ctaText: "Upgrade in SaaS Studio",
      ctaHref: "/dashboard",
    },
    {
      name: "Campus Enterprise",
      tier: "campus_enterprise",
      target: "Universities & multi-campus trusts",
      price: "INR 14,999",
      period: "per month",
      description: "Unlimited regional reach, multi-tenant campus federation, and automated verification concierges.",
      leadQuota: "Unlimited admission leads",
      offerSlots: "Unlimited student opportunities",
      analytics: "Full civic telemetry & automated reporting",
      features: [
        "Unlimited student & resident leads",
        "Unlimited internship postings",
        "Unlimited staff & faculty accounts",
        "Multi-campus federation",
        "Dedicated City Admin concierge",
        "Real-time CRM webhook dispatch",
        "Contract SLA & uptime guarantee",
      ],
      notIncluded: [],
      highlight: false,
      ctaText: "Contact Governance Desk",
      ctaHref: "/dashboard",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] font-mono text-xs uppercase tracking-wider text-[var(--accent-signal)] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Tenant SaaS Entitlements</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[var(--ink-primary)] leading-[1.1] mb-4">
            Predictable Plans for Growing Institutions & Storefronts
          </h1>
          <p className="text-[var(--ink-secondary)] text-base sm:text-lg leading-relaxed">
            Every business and college receives free basic discovery. Upgrade for expanded enquiry lead quotas, active student internships, and conversion analytics.
          </p>
        </div>

        {/* Trust & Monetization Charter Banner */}
        <div className="rounded-lg border-2 border-[var(--ink-primary)] bg-[var(--bg-surface)] p-6 sm:p-8 mb-16 shadow-sm">
          <div className="flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-primary)] mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <span>The OneTownCity Trust & Monetization Charter</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs text-[var(--ink-secondary)] leading-relaxed">
            <div>
              <span className="font-bold text-[var(--ink-primary)] block mb-1">
                01 / VERIFICATION CAN NEVER BE PURCHASED
              </span>
              <p>
                Verification badges (<span className="text-[var(--ink-primary)] font-semibold">DETAILS REVIEWED</span> and <span className="text-[var(--ink-primary)] font-semibold">OWNER CLAIMED</span>) require municipal proof, GSTIN checks, or physical confirmation by City Admins. We never sell verification status as a paid subscription.
              </p>
            </div>
            <div>
              <span className="font-bold text-[var(--ink-primary)] block mb-1">
                02 / CLEAR SPONSORED DISCLOSURE
              </span>
              <p>
                Any sponsored placement is explicitly labeled with an amber <span className="text-amber-800 font-semibold">[SPONSORED]</span> tag. Paid promotions never distort factual civic updates or search accuracy.
              </p>
            </div>
            <div>
              <span className="font-bold text-[var(--ink-primary)] block mb-1">
                03 / ZERO STUDENT APPLICATION FEES
              </span>
              <p>
                Student internships, scholarships, and campus drives must always remain zero-fee. Listing providers demanding application charges are immediately banned from the platform.
              </p>
            </div>
          </div>
        </div>

        {/* 4-Column Architectural Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-lg border bg-[var(--bg-surface)] p-6 flex flex-col justify-between transition-all shadow-sm ${
                p.highlight
                  ? "border-[var(--accent-signal)] ring-1 ring-[var(--accent-signal)]/30"
                  : "border-[var(--border-grid)] hover:border-[var(--ink-primary)]"
              }`}
            >
              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-serif text-2xl font-medium text-[var(--ink-primary)]">
                    {p.name}
                  </h3>
                  {p.highlight && (
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent-signal)] text-white">
                      Recommended
                    </span>
                  )}
                </div>

                <p className="font-mono text-xs text-[var(--ink-secondary)] mb-4">
                  {p.target}
                </p>

                {/* Price */}
                <div className="mb-6 pb-4 border-b border-[var(--border-grid)]">
                  <span className="font-mono text-3xl font-bold text-[var(--ink-primary)]">
                    {p.price}
                  </span>
                  <span className="font-mono text-xs text-[var(--ink-secondary)] ml-1">
                    / {p.period}
                  </span>
                </div>

                {/* Quota Metrics */}
                <div className="space-y-2 mb-6 p-3 rounded bg-[var(--bg-muted)]/50 border border-[var(--border-grid)] font-mono text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--ink-primary)]">
                    <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                    <span className="font-semibold">{p.leadQuota}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--ink-primary)]">
                    <Tag className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                    <span>{p.offerSlots}</span>
                  </div>
                  <div className="text-[10px] text-[var(--ink-secondary)]">
                    {p.analytics}
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 mb-6 text-xs text-[var(--ink-primary)] font-sans">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  {p.notIncluded.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-[var(--ink-secondary)]/60 line-through">
                      <X className="w-3.5 h-3.5 text-[var(--ink-secondary)]/40 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Link
                href={p.ctaHref}
                className={`w-full py-3 rounded font-mono text-xs font-semibold uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 ${
                  p.highlight
                    ? "bg-[var(--accent-signal)] text-white hover:bg-[#e03f0b]"
                    : "border border-[var(--border-grid)] bg-[var(--bg-surface)] text-[var(--ink-primary)] hover:border-[var(--ink-primary)]"
                }`}
              >
                <span>{p.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] p-8 max-w-4xl mx-auto shadow-sm">
          <h2 className="font-serif text-2xl font-medium text-[var(--ink-primary)] mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans leading-relaxed">
            <div>
              <h3 className="font-mono text-xs font-semibold text-[var(--ink-primary)] mb-1 uppercase">
                What happens when our monthly lead quota is reached?
              </h3>
              <p className="text-[var(--ink-secondary)]">
                Additional resident enquiries are still accepted and logged safely in the database, but your inbox displays a quota limit notice until the next calendar billing cycle begins, or until you simulate a plan upgrade in the SaaS Studio.
              </p>
            </div>
            <div>
              <h3 className="font-mono text-xs font-semibold text-[var(--ink-primary)] mb-1 uppercase">
                How can we test plan upgrades locally?
              </h3>
              <p className="text-[var(--ink-secondary)]">
                Our platform runs entirely locally. Inside your <Link href="/dashboard" className="text-[var(--accent-signal)] underline">SaaS Studio</Link>, you can simulate plan upgrades instantly without entering real credit cards.
              </p>
            </div>
            <div>
              <h3 className="font-mono text-xs font-semibold text-[var(--ink-primary)] mb-1 uppercase">
                Can schools or non-profits apply for fee waivers?
              </h3>
              <p className="text-[var(--ink-secondary)]">
                Yes. Recognized municipal schools and charitable education trusts can request custom lead quotas directly from our Central Governance desk.
              </p>
            </div>
            <div>
              <h3 className="font-mono text-xs font-semibold text-[var(--ink-primary)] mb-1 uppercase">
                Can repair shops or plumbers subscribe?
              </h3>
              <p className="text-[var(--ink-secondary)]">
                No. In accordance with OneTownCity master architectural principles, our index is strictly restricted to News & Town Pulse, Education Hub, Student Corner, and Local Commercial Storefronts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
