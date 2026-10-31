"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Eye,
  MessageSquare,
  Phone,
  BarChart3,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  Check,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

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

  // Form state to publish student opportunity
  const [oppTitle, setOppTitle] = useState("");
  const [oppType, setOppType] = useState<string>("internship");
  const [oppDesc, setOppDesc] = useState("");
  const [oppEligibility, setOppEligibility] = useState("");
  const [oppStipend, setOppStipend] = useState("");
  const [isSubmittingOpp, setIsSubmittingOpp] = useState(false);
  const [oppSuccess, setOppSuccess] = useState("");

  // Plan simulator upgrade feedback
  const [planMessage, setPlanMessage] = useState("");

  const currentUserId =
    tenantPersona === "education"
      ? "22222222-2222-2222-2222-222222222204" // Dr. K.S. Rao (Narayana College)
      : "22222222-2222-2222-2222-222222222205"; // V. Ramanathan (Minerva Bookstore)

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = {
        "x-user-id": currentUserId,
        "x-tenant-persona": tenantPersona,
      };

      const [resMetrics, resLeads] = await Promise.all([
        fetch(`${API_BASE}/saas/dashboard`, { headers }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/saas/leads`, { headers }).then((r) => (r.ok ? r.json() : [])),
      ]);

      setMetrics(resMetrics);
      setLeads(resLeads);
    } catch (e) {
      console.error("Failed to load tenant data:", e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, tenantPersona]);

  useEffect(() => {
    fetchDashboardData();
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
        setTimeout(() => setOppSuccess(""), 4000);
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

  return (
    <div className="min-h-screen bg-[#DDE3E8]">
      {/* Top Banner with Executive Persona Switcher */}
      <section className="border-b border-[#C3CDD6] bg-[#3A0F34] hero-radial-plum py-6 px-4 sm:px-6 lg:px-8 text-white shadow-md">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#EAAA00] uppercase tracking-widest font-bold">
              <span className="h-2 w-2 rounded-full bg-[#EAAA00] animate-pulse" />
              <span>Multi-Tenant SaaS Portal</span>
              <span className="text-white/40">/</span>
              <span className="text-white font-normal">{metrics?.city || "Nellore"}</span>
            </div>
            {/* Header Title (Must match orgName for E2E tests) */}
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase font-mono tracking-tight text-white mt-1">
              {orgName}
            </h1>
            <div className="mt-1 flex items-center gap-2 font-mono text-xs text-[#DDE3E8]/80">
              <span>SaaS Plan:</span>
              <span className="rounded bg-[#240820] border border-[#EAAA00]/40 px-2 py-0.5 text-[#EAAA00] font-bold uppercase">
                {metrics?.plan_name || "Education Pro"}
              </span>
            </div>
          </div>

          {/* Test Persona Switcher */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-[#240820] p-1.5 self-start sm:self-auto shadow-lg backdrop-blur-xs">
            <span className="font-mono text-[10px] text-white/70 uppercase px-2 font-semibold">
              Test Persona:
            </span>
            <button
              onClick={() => setTenantPersona("education")}
              className={`rounded-xl px-3.5 py-1.5 font-mono text-xs uppercase font-bold transition-all ${
                tenantPersona === "education"
                  ? "bg-[#EAAA00] text-[#240820] shadow-sm"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              Education Tenant
            </button>
            <button
              onClick={() => setTenantPersona("business")}
              className={`rounded-xl px-3.5 py-1.5 font-mono text-xs uppercase font-bold transition-all ${
                tenantPersona === "business"
                  ? "bg-[#EAAA00] text-[#240820] shadow-sm"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              Business Tenant
            </button>
          </div>
        </div>
      </section>

      {/* Main Container with Deep Left Rail & Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Deep Left Navigation Rail / Plan Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Monthly Lead Quota Card (Must match "lead quota" and "education pro" for tests) */}
            <div className="rounded-2xl bg-[#3A0F34] text-white p-6 shadow-xl space-y-5 border border-white/10">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#EAAA00]" strokeWidth={2} />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    Monthly Lead Quota Meter
                  </span>
                </div>
                <span className="rounded bg-[#240820] border border-[#EAAA00]/40 px-2 py-0.5 font-mono text-[10px] text-[#EAAA00] font-bold uppercase">
                  {metrics?.plan_tier || "edu_pro"}
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-sm text-[#DDE3E8]/80 uppercase">Usage</span>
                  <div className="text-2xl font-extrabold text-white font-mono-numbers">
                    {metrics?.leads_used_this_month || 0}{" "}
                    <span className="text-base font-normal text-[#DDE3E8]/70">
                      / {metrics?.monthly_lead_quota || 5} Leads
                    </span>
                  </div>
                </div>

                {/* Dynamic Gold Progress Bar */}
                <div className="mt-3 h-2.5 w-full rounded-full bg-black/40 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-[#EAAA00] transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((metrics?.leads_used_this_month || 0) / (metrics?.monthly_lead_quota || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between font-mono text-[10px] text-[#DDE3E8]/70">
                  <span>Plan: {metrics?.plan_name || "Education Pro"}</span>
                  <span>Resets 1st of next month</span>
                </div>
              </div>

              {/* Lead routing notice */}
              <div className="rounded-xl bg-black/30 p-3.5 border border-white/10 text-xs font-sans text-white/80 leading-relaxed">
                Direct student inquiries, fee questions, and admission requests routed in real-time to your verified dashboard.
              </div>
            </div>

            {/* Plan Entitlement Simulator */}
            <div className="rounded-2xl border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-[#C3CDD6] pb-3">
                <Sliders className="h-4 w-4 text-[#3A0F34]" strokeWidth={2} />
                <h3 className="font-mono text-xs font-bold uppercase text-[#3A0F34] tracking-wider">
                  SaaS Plan Entitlement Simulator
                </h3>
              </div>
              <p className="font-sans text-xs text-[#5E4B5B]">
                Upgrade tier to expand lead quota instantly without server restarts.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                <button
                  onClick={() => simulatePlanUpgrade("free")}
                  className="rounded-xl border border-[#C3CDD6] bg-white hover:bg-[#3A0F34] hover:text-white p-2.5 text-center font-bold text-[#1E081B] transition-colors shadow-xs uppercase"
                >
                  Free (5)
                </button>
                <button
                  onClick={() => simulatePlanUpgrade("growth_business")}
                  className="rounded-xl border border-[#C3CDD6] bg-white hover:bg-[#3A0F34] hover:text-white p-2.5 text-center font-bold text-[#1E081B] transition-colors shadow-xs uppercase"
                >
                  Growth (25)
                </button>
                <button
                  onClick={() => simulatePlanUpgrade("edu_pro")}
                  className="rounded-xl border border-[#C3CDD6] bg-white hover:bg-[#3A0F34] hover:text-white p-2.5 text-center font-bold text-[#1E081B] transition-colors shadow-xs uppercase"
                >
                  Edu Pro (50)
                </button>
                <button
                  onClick={() => simulatePlanUpgrade("campus_enterprise")}
                  className="rounded-xl border border-[#C3CDD6] bg-white hover:bg-[#3A0F34] hover:text-white p-2.5 text-center font-bold text-[#1E081B] transition-colors shadow-xs uppercase"
                >
                  Enterprise (200)
                </button>
              </div>

              {planMessage && (
                <div className="mt-2 rounded-lg bg-[#0D6E52]/10 border border-[#0D6E52] p-2.5 font-mono text-xs text-[#0D6E52] font-semibold flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  <span>{planMessage}</span>
                </div>
              )}
            </div>

            {/* Post Opportunity Form */}
            <div className="rounded-2xl border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[#C3CDD6] pb-3">
                <PlusCircle className="h-4 w-4 text-[#3A0F34]" strokeWidth={2} />
                <h3 className="font-mono text-xs font-bold uppercase text-[#3A0F34] tracking-wider">
                  Post Student Opportunity / Offer
                </h3>
              </div>

              {oppSuccess && (
                <div className="rounded-lg bg-[#0D6E52]/10 border border-[#0D6E52] p-3 font-mono text-xs text-[#0D6E52] font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{oppSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateOpportunity} className="space-y-3.5 font-mono text-xs">
                <div>
                  <label className="block text-[#5E4B5B] uppercase font-bold mb-1">Opportunity Type</label>
                  <select
                    value={oppType}
                    onChange={(e) => setOppType(e.target.value)}
                    className="w-full rounded-xl border border-[#C3CDD6] bg-white px-3 py-2 text-[#1E081B] outline-none focus:border-[#3A0F34]"
                  >
                    <option value="internship">Internship / Apprenticeship</option>
                    <option value="scholarship">Scholarship / Merit Aid</option>
                    <option value="hackathon">Hackathon / Campus Fair</option>
                    <option value="student_hostel">Verified Student Hostel</option>
                    <option value="student_discount">Student Discount Privilege</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#5E4B5B] uppercase font-bold mb-1">Title *</label>
                  <input
                    type="text"
                    value={oppTitle}
                    onChange={(e) => setOppTitle(e.target.value)}
                    placeholder="e.g. AI & Robotics Summer Internship"
                    className="w-full rounded-xl border border-[#C3CDD6] bg-white px-3 py-2 text-[#1E081B] placeholder-[#5E4B5B] outline-none focus:border-[#3A0F34]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#5E4B5B] uppercase font-bold mb-1">Description *</label>
                  <textarea
                    value={oppDesc}
                    onChange={(e) => setOppDesc(e.target.value)}
                    rows={3}
                    placeholder="Program overview, eligibility, and guidance..."
                    className="w-full rounded-xl border border-[#C3CDD6] bg-white px-3 py-2 text-[#1E081B] placeholder-[#5E4B5B] outline-none focus:border-[#3A0F34]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#5E4B5B] uppercase font-bold mb-1">Stipend or Discount</label>
                  <input
                    type="text"
                    value={oppStipend}
                    onChange={(e) => setOppStipend(e.target.value)}
                    placeholder="e.g. INR 15,000/month or 25% OFF"
                    className="w-full rounded-xl border border-[#C3CDD6] bg-white px-3 py-2 text-[#1E081B] placeholder-[#5E4B5B] outline-none focus:border-[#3A0F34]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOpp}
                  className="w-full rounded-xl bg-[#3A0F34] hover:bg-[#240820] text-white font-mono text-xs font-bold uppercase py-2.5 shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmittingOpp ? "Submitting..." : "Submit to Moderation Queue"}
                </button>
              </form>
            </div>
          </div>

          {/* Main Area (8 cols): 4 Sculpted KPI Cards + Leads Inbox */}
          <div className="lg:col-span-8 space-y-6">
            {/* 4 Sculpted KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Profile Views */}
              <div className="rounded-2xl border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-[#5E4B5B] font-mono text-xs uppercase font-semibold">
                  <span>Profile Views</span>
                  <Eye className="h-4 w-4 text-[#3A0F34]" strokeWidth={2} />
                </div>
                <div className="mt-3 font-mono text-3xl font-extrabold text-[#3A0F34] font-mono-numbers">
                  {metrics?.total_views || 0}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-[#0D6E52] font-semibold">
                  <TrendingUp className="h-3 w-3" />
                  <span>+14% discovery</span>
                </div>
              </div>

              {/* WhatsApp Inquiries */}
              <div className="rounded-2xl border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-[#5E4B5B] font-mono text-xs uppercase font-semibold">
                  <span>WhatsApp Leads</span>
                  <MessageSquare className="h-4 w-4 text-[#0D6E52]" strokeWidth={2} />
                </div>
                <div className="mt-3 font-mono text-3xl font-extrabold text-[#0D6E52] font-mono-numbers">
                  {metrics?.total_whatsapp_clicks || 0}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-[#0D6E52] font-semibold">
                  <TrendingUp className="h-3 w-3" />
                  <span>+22% chat routing</span>
                </div>
              </div>

              {/* Phone Calls */}
              <div className="rounded-2xl border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-[#5E4B5B] font-mono text-xs uppercase font-semibold">
                  <span>Phone Calls</span>
                  <Phone className="h-4 w-4 text-[#3A0F34]" strokeWidth={2} />
                </div>
                <div className="mt-3 font-mono text-3xl font-extrabold text-[#3A0F34] font-mono-numbers">
                  {metrics?.total_call_clicks || 0}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-[#5E4B5B]">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Direct desk inquiries</span>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="rounded-2xl border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-[#5E4B5B] font-mono text-xs uppercase font-semibold">
                  <span>Lead Routing</span>
                  <Sparkles className="h-4 w-4 text-[#EAAA00]" strokeWidth={2} />
                </div>
                <div className="mt-3 font-mono text-3xl font-extrabold text-[#1E081B] font-mono-numbers">
                  100%
                </div>
                <div className="mt-1 text-[11px] font-mono text-[#0D6E52] font-semibold">
                  Verified delivery
                </div>
              </div>
            </div>

            {/* Actionable Lead Inbox Table / Cards */}
            <div className="rounded-2xl border border-[#C3CDD6] bg-[#F8FAFC] p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C3CDD6] pb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#3A0F34]" strokeWidth={2} />
                  <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#3A0F34]">
                    Actionable Lead Inbox ({leads.length})
                  </h2>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveLeadFilter("all")}
                    className={`rounded-xl px-3 py-1 font-mono text-xs uppercase font-bold transition-all ${
                      activeLeadFilter === "all"
                        ? "bg-[#3A0F34] text-white shadow-xs"
                        : "bg-white border border-[#C3CDD6] text-[#5E4B5B] hover:text-[#1E081B]"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveLeadFilter("open")}
                    className={`rounded-xl px-3 py-1 font-mono text-xs uppercase font-bold transition-all ${
                      activeLeadFilter === "open"
                        ? "bg-[#3A0F34] text-white shadow-xs"
                        : "bg-white border border-[#C3CDD6] text-[#5E4B5B] hover:text-[#1E081B]"
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => setActiveLeadFilter("responded")}
                    className={`rounded-xl px-3 py-1 font-mono text-xs uppercase font-bold transition-all ${
                      activeLeadFilter === "responded"
                        ? "bg-[#3A0F34] text-white shadow-xs"
                        : "bg-white border border-[#C3CDD6] text-[#5E4B5B] hover:text-[#1E081B]"
                    }`}
                  >
                    Responded
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="py-12 text-center font-mono text-xs text-[#5E4B5B] uppercase">
                  Loading leads...
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="py-12 text-center font-mono text-xs text-[#5E4B5B] uppercase">
                  No leads matching current filter.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-xl border border-[#C3CDD6] bg-white p-4.5 shadow-xs hover:border-[#3A0F34] transition-all space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C3CDD6]/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#1E081B] uppercase">
                            {lead.inquirer_name}
                          </span>
                          <span className="rounded bg-[#DDE3E8] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#1E081B] uppercase">
                            {lead.enquiry_type.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-[#5E4B5B] font-mono-numbers">
                            {new Date(lead.created_at).toISOString().split("T")[0]}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 font-mono text-[9px] font-bold uppercase shadow-xs ${
                              lead.status === "open"
                                ? "bg-[#EAAA00] text-[#240820]"
                                : "bg-[#0D6E52] text-white"
                            }`}
                          >
                            {lead.status}
                          </span>
                        </div>
                      </div>

                      <p className="font-sans text-xs text-[#1E081B]/85 leading-relaxed">
                        {lead.message}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#C3CDD6]/60 pt-2 font-mono text-[11px] text-[#5E4B5B]">
                        <div className="flex items-center gap-3">
                          <span>Phone: <strong className="text-[#1E081B]">{lead.inquirer_phone}</strong></span>
                          {lead.inquirer_email && <span>Email: <strong className="text-[#1E081B]">{lead.inquirer_email}</strong></span>}
                        </div>

                        <button
                          onClick={() => toggleLeadStatus(lead.id, lead.status)}
                          className="rounded-lg border border-[#C3CDD6] bg-[#DDE3E8]/60 hover:bg-[#3A0F34] hover:text-white px-3 py-1 font-mono text-[10px] font-bold text-[#1E081B] uppercase transition-colors"
                        >
                          Mark as {lead.status === "open" ? "Responded" : "Open"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
