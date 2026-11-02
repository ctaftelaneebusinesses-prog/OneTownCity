"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Eye,
  MessageSquare,
  Phone,
  BarChart3,
  CheckCircle2,
  PlusCircle,
  TrendingUp,
  ArrowUpRight,
  Check,
  X,
  Send,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

// Swiss Civic Editorial design tokens
const T = {
  canvas:    "#F4F2EE",
  surface:   "#FFFFFF",
  muted:     "#EAE6DF",
  inkPrim:   "#111110",
  inkSec:    "#575551",
  inkTert:   "#8B877F",
  border:    "#D8D3C8",
  accent:    "#FF4F17",
  verified:  "#0D6847",
  sponsored: "#D97706",
  rail:      "#111110",
  railText:  "#F4F2EE",
};

type TenantMetrics = {
  organization_name: string;
  organization_slug: string;
  vertical: string;
  city: string;
  plan_name: string;
  plan_tier: string;
  monthly_lead_quota: number;
  leads_used_this_month: number;
  total_views: number;
  total_whatsapp_clicks: number;
  total_call_clicks: number;
};

type LeadItem = {
  id: string;
  listing_id: string;
  listing_name: string;
  inquirer_name: string;
  inquirer_phone: string;
  inquirer_email: string;
  enquiry_type: string;
  message: string;
  status: "open" | "responded" | "closed";
  created_at: string;
};

export default function TenantDashboard() {
  const [tenantPersona, setTenantPersona] = useState<"education" | "business">("education");
  const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [activeLeadFilter, setActiveLeadFilter] = useState<"all" | "open" | "responded">("all");
  const [isLoading, setIsLoading] = useState(true);

  // Slide-over modal state
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  // Form state to publish student opportunity / offer
  const [oppTitle, setOppTitle] = useState("");
  const [oppType, setOppType] = useState<string>("internship");
  const [oppDesc, setOppDesc] = useState("");
  const [oppEligibility, setOppEligibility] = useState("");
  const [oppStipend, setOppStipend] = useState("");
  const [isSubmittingOpp, setIsSubmittingOpp] = useState(false);
  const [oppSuccess, setOppSuccess] = useState("");

  // Plan simulator upgrade feedback
  const [planMessage, setPlanMessage] = useState("");

  // 1-Click Freshness Reconfirmation state
  const [isReconfirming, setIsReconfirming] = useState(false);
  const [reconfirmMessage, setReconfirmMessage] = useState("");

  const currentUserId =
    tenantPersona === "education"
      ? "22222222-2222-2222-2222-222222222204" // Dr. K.S. Rao (Narayana College)
      : "22222222-2222-2222-2222-222222222205"; // V. Ramanathan (Minerva Bookstore)

  const tenantListingId =
    tenantPersona === "education"
      ? "55555555-5555-5555-5555-555555555501"
      : "55555555-5555-5555-5555-555555555502";

  const handleReconfirmListing = async () => {
    setIsReconfirming(true);
    try {
      const headers: Record<string, string> = {
        "x-user-id": currentUserId,
        "x-tenant-persona": tenantPersona,
      };
      const res = await fetch(`${API_BASE}/saas/listings/${tenantListingId}/reconfirm`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        setReconfirmMessage("Listing freshness successfully reconfirmed for 30-day prominence cycle.");
        setTimeout(() => setReconfirmMessage(""), 4500);
      }
    } catch (e) {
      console.error("Reconfirmation error:", e);
    } finally {
      setIsReconfirming(false);
    }
  };

  const fetchDashboardData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const headers = {
        "x-user-id": currentUserId,
        "x-tenant-persona": tenantPersona,
      };

      const [resMetrics, resLeads] = await Promise.all([
        fetch(`${API_BASE}/saas/dashboard`, { headers, signal }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/saas/leads`, { headers, signal }).then((r) => (r.ok ? r.json() : [])),
      ]);

      if (signal?.aborted) return;
      setMetrics(resMetrics);
      setLeads(resLeads);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("Failed to load tenant data:", e);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [currentUserId, tenantPersona]);

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    return () => controller.abort();
  }, [fetchDashboardData]);

  const toggleLeadStatus = async (leadId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "open" ? "responded" : "open";
    try {
      const res = await fetch(`${API_BASE}/saas/leads/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
          "x-tenant-persona": tenantPersona,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus as "open" | "responded" } : l))
        );
      }
    } catch (e) {
      console.error("Error updating lead status:", e);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppTitle || !oppDesc) return;

    setIsSubmittingOpp(true);
    setOppSuccess("");

    try {
      const res = await fetch(`${API_BASE}/saas/opportunities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
          "x-tenant-persona": tenantPersona,
        },
        body: JSON.stringify({
          opportunity_type: oppType,
          title: oppTitle,
          provider_name: metrics?.organization_name || "Institution Provider",
          description: oppDesc,
          eligibility: oppEligibility || undefined,
          stipend_amount: oppStipend || undefined,
        }),
      });

      if (res.ok) {
        setOppSuccess("Opportunity submitted to City Admin review queue.");
        setOppTitle("");
        setOppDesc("");
        setOppEligibility("");
        setOppStipend("");
        setTimeout(() => {
          setOppSuccess("");
          setIsSlideOverOpen(false);
        }, 2200);
      }
    } catch (e) {
      console.error("Error publishing opportunity:", e);
    } finally {
      setIsSubmittingOpp(false);
    }
  };

  const simulatePlanUpgrade = async (tier: string) => {
    try {
      const res = await fetch(`${API_BASE}/saas/plan`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
          "x-tenant-persona": tenantPersona,
        },
        body: JSON.stringify({ plan_tier: tier }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlanMessage(data.message || `Switched to ${tier}`);
        fetchDashboardData();
        setTimeout(() => setPlanMessage(""), 4000);
      }
    } catch (e) {
      console.error("Error simulating plan upgrade:", e);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (activeLeadFilter === "all") return true;
    return lead.status === activeLeadFilter;
  });

  const orgName = metrics?.organization_name || "Narayana Engineering College";

  const quotaPct = Math.min(
    100,
    ((metrics?.leads_used_this_month || 0) / (metrics?.monthly_lead_quota || 1)) * 100
  );

  // Input style reused across form fields
  const inputCls: React.CSSProperties = {
    width: "100%",
    border: `1px solid ${T.border}`,
    background: T.surface,
    borderRadius: 4,
    padding: "7px 10px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: T.inkPrim,
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: T.canvas, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Top Banner ─────────────────────────────────────────── */}
      <header className="w-full border-b px-4 sm:px-8 py-3.5" style={{ background: T.rail, borderColor: T.border }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">

          {/* Left: wordmark + org */}
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.inkTert, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 4 }}>
              SAAS STUDIO / {metrics?.city || "Nellore"}
            </div>
            <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: T.railText, textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
              {orgName}
            </h1>
          </div>

          {/* Right: persona switcher + CTA */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Persona pill toggle */}
            <div style={{ display: "flex", border: `1px solid #333330`, borderRadius: 6, overflow: "hidden" }}>
              {(["education", "business"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setTenantPersona(p)}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    padding: "6px 14px",
                    background: tenantPersona === p ? T.accent : "transparent",
                    color: tenantPersona === p ? "#FFFFFF" : T.inkTert,
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  {p === "education" ? "Education Tenant" : "Business Tenant"}
                </button>
              ))}
            </div>

            {/* Post Opportunity CTA */}
            <button
              onClick={() => setIsSlideOverOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: T.accent,
                color: "#FFFFFF",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                border: "none",
                borderRadius: 4,
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              <PlusCircle size={14} strokeWidth={2.2} />
              Post Opportunity
            </button>
          </div>
        </div>
      </header>

      {/* ── Body: Rail + Main ──────────────────────────────────── */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[calc(100vh-61px)] overflow-x-hidden">

        {/* ── LEFT RAIL ─────────────────────────────────────────── */}
        <aside className="w-full p-5 sm:p-7 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r" style={{ background: T.rail, borderColor: "#222220" }}>

          {/* Section label */}
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: T.inkTert }}>
            SAAS STUDIO
          </div>

          {/* Anti-scam notice embedded in rail */}
          <div style={{ border: `1px solid #2E2E2C`, borderRadius: 4, padding: "10px 12px", background: "#1A1A18" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertTriangle size={13} color={T.accent} style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8B877F", lineHeight: 1.6, margin: 0 }}>
                ANTI-SCAM: Never pay money to apply for any internship or job. All listings on OneTownCity are free to apply.
              </p>
            </div>
          </div>

          {/* Monthly Lead Quota */}
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: T.inkTert, marginBottom: 12 }}>
              Monthly Lead Quota
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: T.railText }}>
                {metrics?.leads_used_this_month || 0}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: T.inkTert }}>
                / {metrics?.monthly_lead_quota || 5}
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 4, background: "#2A2A28", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${quotaPct}%`, background: T.accent, borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.inkTert }}>
                {metrics?.plan_name || "Education Pro"}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.inkTert }}>
                Resets 1st
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#222220" }} />

          {/* Plan Tier Simulator */}
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: T.inkTert, marginBottom: 12 }}>
              Plan Tier Simulator
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { label: "Free (5)", tier: "free" },
                { label: "Growth Business (25)", tier: "growth_business" },
                { label: "Edu Pro (50)", tier: "edu_pro" },
                { label: "Campus Enterprise (200)", tier: "campus_enterprise" },
              ].map(({ label, tier }) => (
                <button
                  key={tier}
                  onClick={() => simulatePlanUpgrade(tier)}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "8px 6px",
                    background: metrics?.plan_tier === tier ? T.accent : "#1A1A18",
                    color: metrics?.plan_tier === tier ? "#FFFFFF" : T.inkTert,
                    border: `1px solid ${metrics?.plan_tier === tier ? T.accent : "#2E2E2C"}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    textAlign: "center",
                    lineHeight: 1.3,
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {planMessage && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", border: `1px solid ${T.verified}`, borderRadius: 4, background: "rgba(13,104,71,0.1)" }}>
                <Check size={12} color={T.verified} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.verified }}>{planMessage}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#222220" }} />

          {/* Post opportunity shortcut */}
          <button
            onClick={() => setIsSlideOverOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px",
              border: `1px solid #2E2E2C`,
              borderRadius: 4,
              background: "transparent",
              color: T.inkTert,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
            }}
          >
            <PlusCircle size={12} />
            Post New Opportunity / Offer
          </button>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────────── */}
        <main className="p-4 sm:p-7 flex flex-col gap-5 w-full min-w-0 overflow-x-hidden">

          {/* Listing Freshness Guarantee & 1-Click Reconfirmation */}
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: "16px 20px",
            }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: T.inkPrim,
                  }}
                >
                  Profile Completeness &amp; Freshness Meter
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#0D6847",
                    background: "rgba(13,104,71,0.1)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  95% High Craft
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: T.inkTert,
                  }}
                >
                  30-Day Freshness Cycle Active
                </span>
              </div>
              <div style={{ height: 6, background: "#EAE6DF", borderRadius: 3, overflow: "hidden", maxWidth: 420 }}>
                <div style={{ height: "100%", width: "95%", background: "#0D6847", borderRadius: 3 }} />
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: T.inkTert,
                  marginTop: 6,
                }}
              >
                Audited: Verified Fee Range · Operating Hours · Locality Map · Consented WhatsApp · Telugu Search Alias
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleReconfirmListing}
                disabled={isReconfirming}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  background: T.accent,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 4,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  cursor: isReconfirming ? "not-allowed" : "pointer",
                  opacity: isReconfirming ? 0.7 : 1,
                  boxShadow: "0 1px 3px rgba(255,79,23,0.2)",
                }}
              >
                <CheckCircle2 size={13} />
                <span>{isReconfirming ? "Reconfirming..." : "Reconfirm Details Are Current"}</span>
              </button>
            </div>
          </div>

          {reconfirmMessage && (
            <div
              style={{
                padding: "10px 14px",
                border: `1px solid ${T.verified}`,
                borderRadius: 4,
                background: "rgba(13,104,71,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Check size={14} color={T.verified} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.verified, fontWeight: 600 }}>
                {reconfirmMessage}
              </span>
            </div>
          )}

          {/* 4 KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full">
            {[
              { label: "Profile Views",        value: metrics?.total_views || 0,            note: "+14% discovery",       icon: <Eye size={14} color={T.inkTert} />,         noteColor: T.verified },
              { label: "WhatsApp Leads",        value: metrics?.total_whatsapp_clicks || 0,  note: "+22% chat routing",    icon: <MessageSquare size={14} color={T.verified} />, noteColor: T.verified },
              { label: "Phone Calls",           value: metrics?.total_call_clicks || 0,      note: "Direct desk inquiries", icon: <Phone size={14} color={T.inkTert} />,        noteColor: T.inkTert },
              { label: "Lead Routing Rate",     value: "100%",                               note: "Verified delivery",    icon: <BarChart3 size={14} color={T.accent} />,      noteColor: T.verified },
            ].map(({ label, value, note, icon, noteColor }) => (
              <div
                key={label}
                style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "16px 16px 14px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.inkTert }}>
                    {label}
                  </span>
                  {icon}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, fontWeight: 700, color: T.inkPrim, lineHeight: 1, marginBottom: 6 }}>
                  {value}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: noteColor, display: "flex", alignItems: "center", gap: 4 }}>
                  <TrendingUp size={10} />
                  {note}
                </div>
              </div>
            ))}
          </div>

          {/* Lead Inbox */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, overflow: "hidden" }}>
            {/* Inbox header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 gap-3 border-b" style={{ borderColor: T.border }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowUpRight size={14} color={T.inkTert} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.inkPrim }}>
                  Actionable Lead Inbox ({leads.length})
                </span>
              </div>
              {/* Filter pills */}
              <div style={{ display: "flex", gap: 4 }}>
                {(["all", "open", "responded"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveLeadFilter(f)}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      border: `1px solid ${activeLeadFilter === f ? T.accent : T.border}`,
                      borderRadius: 3,
                      background: activeLeadFilter === f ? T.accent : "transparent",
                      color: activeLeadFilter === f ? "#FFFFFF" : T.inkTert,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Table wrapper for horizontal scrolling on narrow screens */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[560px]">
                {/* Table header row */}
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1.2fr 90px 90px", padding: "8px 16px", borderBottom: `1px solid ${T.border}`, background: T.muted }}>
                  {["Inquirer", "Type", "Message", "Date", "Status"].map((h) => (
                    <span key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.inkTert }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                {isLoading ? (
                  <div style={{ padding: 40, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.inkTert, textTransform: "uppercase" }}>
                    Loading leads...
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.inkTert, textTransform: "uppercase" }}>
                    No leads matching current filter.
                  </div>
                ) : (
                  filteredLeads.map((lead, idx) => (
                    <div
                      key={lead.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.4fr 1fr 1.2fr 90px 90px",
                        padding: "12px 16px",
                        borderBottom: idx < filteredLeads.length - 1 ? `1px solid ${T.border}` : "none",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {/* Inquirer */}
                      <div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: T.inkPrim }}>{lead.inquirer_name}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.inkTert, marginTop: 2 }}>{lead.inquirer_phone}</div>
                      </div>

                      {/* Type */}
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, color: T.inkSec, textTransform: "uppercase" }}>
                        {lead.enquiry_type.replace(/_/g, " ")}
                      </div>

                      {/* Message */}
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: T.inkSec, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                        {lead.message}
                      </div>

                      {/* Date */}
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.inkTert }}>
                        {new Date(lead.created_at).toISOString().split("T")[0]}
                      </div>

                      {/* Status + action */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            padding: "2px 7px",
                            borderRadius: 3,
                            background: lead.status === "open" ? T.sponsored : T.verified,
                            color: "#FFFFFF",
                          }}
                        >
                          {lead.status}
                        </span>
                        <button
                          onClick={() => toggleLeadStatus(lead.id, lead.status)}
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            padding: "3px 7px",
                            border: `1px solid ${T.border}`,
                            borderRadius: 3,
                            background: "transparent",
                            color: T.inkSec,
                            cursor: "pointer",
                          }}
                        >
                          {lead.status === "open" ? "Mark Responded" : "Reopen"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Slide-Over Drawer ─────────────────────────────────── */}
      {isSlideOverOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          {/* Backdrop */}
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }}
            onClick={() => setIsSlideOverOpen(false)}
          />

          {/* Panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(420px, 100vw)",
              background: T.surface,
              borderLeft: `1px solid ${T.border}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Drawer header */}
            <div style={{ background: T.rail, padding: "18px 20px", borderBottom: `1px solid #222220`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: T.inkTert, marginBottom: 4 }}>
                  PUBLISH OPPORTUNITY
                </div>
                <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: T.railText, margin: 0, textTransform: "uppercase" }}>
                  Post Opportunity / Offer
                </h3>
              </div>
              <button
                onClick={() => setIsSlideOverOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: T.inkTert, display: "flex" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Description */}
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${T.border}`, background: T.muted }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: T.inkSec, margin: 0, lineHeight: 1.6 }}>
                Submit internships, scholarships, campus drives, or student discount passes to the city moderation queue.
              </p>
            </div>

            {/* Form body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {oppSuccess && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "10px 12px", border: `1px solid ${T.verified}`, borderRadius: 4, background: "rgba(13,104,71,0.08)" }}>
                  <CheckCircle2 size={14} color={T.verified} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.verified }}>{oppSuccess}</span>
                </div>
              )}

              <form id="opportunity-form" onSubmit={handleCreateOpportunity} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Opportunity Type */}
                <div>
                  <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.inkTert, marginBottom: 6 }}>
                    Opportunity Type *
                  </label>
                  <select
                    value={oppType}
                    onChange={(e) => setOppType(e.target.value)}
                    style={inputCls}
                  >
                    <option value="internship">Internship / Apprenticeship</option>
                    <option value="scholarship">Scholarship / Merit Aid</option>
                    <option value="hackathon">Hackathon / Campus Fair</option>
                    <option value="student_hostel">Verified Student Hostel</option>
                    <option value="student_discount">Student Discount Privilege</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.inkTert, marginBottom: 6 }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={oppTitle}
                    onChange={(e) => setOppTitle(e.target.value)}
                    placeholder="e.g. AI & Robotics Summer Internship"
                    required
                    style={inputCls}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.inkTert, marginBottom: 6 }}>
                    Description *
                  </label>
                  <textarea
                    value={oppDesc}
                    onChange={(e) => setOppDesc(e.target.value)}
                    rows={4}
                    placeholder="Program overview, eligibility criteria, and instructions..."
                    required
                    style={{ ...inputCls, resize: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.6 }}
                  />
                </div>

                {/* Stipend */}
                <div>
                  <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.inkTert, marginBottom: 6 }}>
                    Stipend or Benefit Value
                  </label>
                  <input
                    type="text"
                    value={oppStipend}
                    onChange={(e) => setOppStipend(e.target.value)}
                    placeholder="e.g. INR 15,000/month or 25% OFF"
                    style={inputCls}
                  />
                </div>

                {/* Eligibility */}
                <div>
                  <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.inkTert, marginBottom: 6 }}>
                    Eligibility
                  </label>
                  <input
                    type="text"
                    value={oppEligibility}
                    onChange={(e) => setOppEligibility(e.target.value)}
                    placeholder="e.g. 2nd & 3rd Year B.Tech / BCA Students"
                    style={inputCls}
                  />
                </div>
              </form>
            </div>

            {/* Drawer footer */}
            <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}`, background: T.muted, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsSlideOverOpen(false)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "8px 16px",
                  border: `1px solid ${T.border}`,
                  borderRadius: 4,
                  background: T.surface,
                  color: T.inkSec,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="opportunity-form"
                disabled={isSubmittingOpp}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 4,
                  background: isSubmittingOpp ? T.inkTert : T.accent,
                  color: "#FFFFFF",
                  cursor: isSubmittingOpp ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                }}
              >
                <Send size={12} />
                {isSubmittingOpp ? "Submitting..." : "Submit to Moderation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
