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

  return (
    <div className="min-h-screen bg-[#DDE3E8]">
      {/* Imperial Plum Header Section */}
      <section className="border-b border-[#C3CDD6] bg-[#3A0F34] bg-grid-plum py-8 px-4 sm:px-6 shadow-sm">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-[#EAAA00] uppercase tracking-widest font-semibold">
                Multi-Tenant SaaS Portal
              </div>
              <h1 className="font-mono text-2xl font-bold uppercase text-[#F8FAFC] sm:text-3xl tracking-tight mt-1">
                {metrics?.organization_name || "Tenant Dashboard"}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-[#DDE3E8]/80">
                <span>Location: <strong className="text-[#F8FAFC]">{metrics?.city || "Nellore"}</strong></span>
                <span>|</span>
                <span>Plan: <strong className="text-[#EAAA00] uppercase">{metrics?.plan_name}</strong></span>
              </div>
            </div>

            {/* Test Persona Switcher */}
            <div className="flex items-center gap-2 rounded-lg border border-[#EAAA00]/40 bg-[#240820] p-1.5 self-start sm:self-auto shadow-sm">
              <span className="font-mono text-[10px] text-[#DDE3E8]/70 uppercase px-2 font-semibold">
                Test Persona:
              </span>
              <button
                onClick={() => setTenantPersona("education")}
                className={`rounded px-3 py-1.5 font-mono text-xs uppercase font-bold transition-all ${
                  tenantPersona === "education"
                    ? "bg-[#EAAA00] text-[#240820] shadow-xs"
                    : "text-[#F8FAFC] hover:bg-[#3A0F34]"
                }`}
              >
                Education Tenant
              </button>
              <button
                onClick={() => setTenantPersona("business")}
                className={`rounded px-3 py-1.5 font-mono text-xs uppercase font-bold transition-all ${
                  tenantPersona === "business"
                    ? "bg-[#EAAA00] text-[#240820] shadow-xs"
                    : "text-[#F8FAFC] hover:bg-[#3A0F34]"
                }`}
              >
                Business Tenant
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {planMessage && (
          <div className="mb-6 rounded-lg border border-[#0D6E52] bg-[#F8FAFC] p-3.5 font-mono text-xs text-[#0D6E52] flex items-center gap-2 shadow-sm">
            <Sparkles className="h-4 w-4 text-[#0D6E52]" strokeWidth={2} />
            <span className="font-bold">{planMessage}</span>
          </div>
        )}

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Profile Views */}
          <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm hover:border-[#3A0F34] transition-all">
            <div className="flex items-center justify-between text-[#5E4B5B] font-mono text-xs uppercase font-semibold">
              <span>Total Profile Views</span>
              <Eye className="h-4 w-4 text-[#3A0F34]" strokeWidth={1.75} />
            </div>
            <div className="mt-3 font-mono text-2xl font-bold text-[#3A0F34] font-mono-numbers">
              {metrics?.total_views || 0}
            </div>
            <div className="mt-1 font-mono text-[10px] text-[#5E4B5B] uppercase">
              Organic discovery traffic
            </div>
          </div>

          {/* WhatsApp Actions */}
          <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm hover:border-[#3A0F34] transition-all">
            <div className="flex items-center justify-between text-[#5E4B5B] font-mono text-xs uppercase font-semibold">
              <span>WhatsApp Clicks</span>
              <MessageSquare className="h-4 w-4 text-[#0D6E52]" strokeWidth={1.75} />
            </div>
            <div className="mt-3 font-mono text-2xl font-bold text-[#0D6E52] font-mono-numbers">
              {metrics?.total_whatsapp_clicks || 0}
            </div>
            <div className="mt-1 font-mono text-[10px] text-[#5E4B5B] uppercase">
              Direct chat inquiries
            </div>
          </div>

          {/* Phone Calls */}
          <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm hover:border-[#3A0F34] transition-all">
            <div className="flex items-center justify-between text-[#5E4B5B] font-mono text-xs uppercase font-semibold">
              <span>Phone Inquiries</span>
              <Phone className="h-4 w-4 text-[#3A0F34]" strokeWidth={1.75} />
            </div>
            <div className="mt-3 font-mono text-2xl font-bold text-[#3A0F34] font-mono-numbers">
              {metrics?.total_call_clicks || 0}
            </div>
            <div className="mt-1 font-mono text-[10px] text-[#5E4B5B] uppercase">
              Direct telephone clicks
            </div>
          </div>

          {/* Monthly Lead Quota */}
          <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm flex flex-col justify-between hover:border-[#3A0F34] transition-all">
            <div>
              <div className="flex items-center justify-between text-[#5E4B5B] font-mono text-xs uppercase font-semibold">
                <span>Lead Quota Usage</span>
                <BarChart3 className="h-4 w-4 text-[#EAAA00]" strokeWidth={2} />
              </div>
              <div className="mt-3 font-mono text-xl font-bold text-[#1E081B] font-mono-numbers">
                {metrics?.leads_used_this_month || 0} / {metrics?.monthly_lead_quota || 5}
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-2 w-full rounded bg-[#DDE3E8] overflow-hidden border border-[#C3CDD6]">
                <div
                  className="h-full bg-[#EAAA00] transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      ((metrics?.leads_used_this_month || 0) / (metrics?.monthly_lead_quota || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div className="mt-2 font-mono text-[10px] text-[#5E4B5B] uppercase font-semibold">
              Plan: {metrics?.plan_tier} | Resets monthly
            </div>
          </div>
        </div>

        {/* Plan Simulator Ribbon */}
        <div className="mt-8 rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase text-[#3A0F34]">
                SaaS Plan Entitlement Simulator
              </span>
              <span className="rounded bg-[#EAAA00] px-2 py-0.5 font-mono text-[10px] font-bold text-[#240820] uppercase shadow-xs">
                Active: {metrics?.plan_tier}
              </span>
            </div>
            <p className="mt-1 font-sans text-xs text-[#5E4B5B]">
              Test SaaS plan lead unlocking. Quotas increase dynamically without restarting services.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => simulatePlanUpgrade("free")}
              className="rounded border border-[#C3CDD6] bg-[#DDE3E8] px-3 py-1.5 font-mono text-xs font-semibold text-[#1E081B] hover:bg-[#3A0F34] hover:text-[#F8FAFC] uppercase transition-colors"
            >
              Free (5)
            </button>
            <button
              onClick={() => simulatePlanUpgrade("growth_business")}
              className="rounded border border-[#C3CDD6] bg-[#DDE3E8] px-3 py-1.5 font-mono text-xs font-semibold text-[#1E081B] hover:bg-[#3A0F34] hover:text-[#F8FAFC] uppercase transition-colors"
            >
              Growth (25)
            </button>
            <button
              onClick={() => simulatePlanUpgrade("edu_pro")}
              className="rounded border border-[#C3CDD6] bg-[#DDE3E8] px-3 py-1.5 font-mono text-xs font-semibold text-[#1E081B] hover:bg-[#3A0F34] hover:text-[#F8FAFC] uppercase transition-colors"
            >
              Edu Pro (50)
            </button>
            <button
              onClick={() => simulatePlanUpgrade("campus_enterprise")}
              className="rounded border border-[#C3CDD6] bg-[#DDE3E8] px-3 py-1.5 font-mono text-xs font-semibold text-[#1E081B] hover:bg-[#3A0F34] hover:text-[#F8FAFC] uppercase transition-colors"
            >
              Enterprise (200)
            </button>
          </div>
        </div>

        {/* Two Column Section: Leads Inbox + Publish Opportunity */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leads Inbox (2 Cols) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-[#C3CDD6] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#3A0F34]" strokeWidth={1.75} />
                <h2 className="font-mono text-sm font-bold uppercase text-[#3A0F34] tracking-wider">
                  Actionable Lead Inbox ({leads.length})
                </h2>
              </div>

              {/* Filter buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveLeadFilter("all")}
                  className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase font-bold transition-colors ${
                    activeLeadFilter === "all"
                      ? "bg-[#3A0F34] text-[#F8FAFC]"
                      : "bg-[#F8FAFC] text-[#5E4B5B] border border-[#C3CDD6] hover:text-[#1E081B]"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveLeadFilter("open")}
                  className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase font-bold transition-colors ${
                    activeLeadFilter === "open"
                      ? "bg-[#3A0F34] text-[#F8FAFC]"
                      : "bg-[#F8FAFC] text-[#5E4B5B] border border-[#C3CDD6] hover:text-[#1E081B]"
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setActiveLeadFilter("responded")}
                  className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase font-bold transition-colors ${
                    activeLeadFilter === "responded"
                      ? "bg-[#3A0F34] text-[#F8FAFC]"
                      : "bg-[#F8FAFC] text-[#5E4B5B] border border-[#C3CDD6] hover:text-[#1E081B]"
                  }`}
                >
                  Responded
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="py-8 text-center font-mono text-xs text-[#5E4B5B] uppercase">
                Loading leads inbox...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] py-10 text-center font-mono text-xs text-[#5E4B5B] uppercase shadow-xs">
                No leads currently matching filter criteria.
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-4 flex flex-col justify-between shadow-sm hover:border-[#3A0F34] transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C3CDD6] pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1E081B] uppercase">
                          {lead.inquirer_name}
                        </span>
                        <span className="rounded bg-[#DDE3E8] border border-[#C3CDD6] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#1E081B] uppercase">
                          {lead.enquiry_type.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#5E4B5B] font-mono-numbers">
                          {new Date(lead.created_at).toISOString().split("T")[0]}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                            lead.status === "open"
                              ? "bg-[#EAAA00] text-[#240820] shadow-xs"
                              : "bg-[#0D6E52] text-white shadow-xs"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>
                    </div>

                    <p className="font-sans text-xs text-[#1E081B]/85 my-2">{lead.message}</p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#C3CDD6] pt-2 font-mono text-[11px] text-[#5E4B5B]">
                      <div className="flex items-center gap-3">
                        <span>Phone: <strong className="text-[#1E081B]">{lead.inquirer_phone}</strong></span>
                        {lead.inquirer_email && <span>Email: <strong className="text-[#1E081B]">{lead.inquirer_email}</strong></span>}
                      </div>

                      <button
                        onClick={() => toggleLeadStatus(lead.id, lead.status)}
                        className="rounded border border-[#C3CDD6] bg-[#DDE3E8] px-2.5 py-1 font-mono text-[10px] font-bold text-[#1E081B] hover:bg-[#3A0F34] hover:text-[#F8FAFC] uppercase transition-colors"
                      >
                        Mark as {lead.status === "open" ? "Responded" : "Open"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Publish Opportunity / Offer Form (1 Col) */}
          <div>
            <div className="border-b border-[#C3CDD6] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-[#3A0F34]" strokeWidth={1.75} />
                <h2 className="font-mono text-sm font-bold uppercase text-[#3A0F34] tracking-wider">
                  Post Opportunity
                </h2>
              </div>
            </div>

            <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm">
              {oppSuccess && (
                <div className="mb-4 flex items-center gap-2 rounded bg-[#0D6E52]/10 border border-[#0D6E52] p-3 font-mono text-xs text-[#0D6E52] font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-[#0D6E52]" strokeWidth={2} />
                  <span>{oppSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateOpportunity} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[#5E4B5B] uppercase font-bold mb-1">Opportunity Type</label>
                  <select
                    value={oppType}
                    onChange={(e) => setOppType(e.target.value)}
                    className="w-full rounded border border-[#C3CDD6] bg-[#DDE3E8]/40 px-3 py-2 text-[#1E081B] outline-none focus:border-[#3A0F34]"
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
                    className="w-full rounded border border-[#C3CDD6] bg-[#DDE3E8]/40 px-3 py-2 text-[#1E081B] placeholder-[#5E4B5B] outline-none focus:border-[#3A0F34]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#5E4B5B] uppercase font-bold mb-1">Description *</label>
                  <textarea
                    value={oppDesc}
                    onChange={(e) => setOppDesc(e.target.value)}
                    rows={3}
                    placeholder="Program overview, deliverables, and guidance..."
                    className="w-full rounded border border-[#C3CDD6] bg-[#DDE3E8]/40 px-3 py-2 text-[#1E081B] placeholder-[#5E4B5B] outline-none focus:border-[#3A0F34]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#5E4B5B] uppercase font-bold mb-1">Eligibility Criteria</label>
                  <input
                    type="text"
                    value={oppEligibility}
                    onChange={(e) => setOppEligibility(e.target.value)}
                    placeholder="e.g. 3rd/4th year CSE / ECE students"
                    className="w-full rounded border border-[#C3CDD6] bg-[#DDE3E8]/40 px-3 py-2 text-[#1E081B] placeholder-[#5E4B5B] outline-none focus:border-[#3A0F34]"
                  />
                </div>

                <div>
                  <label className="block text-[#5E4B5B] uppercase font-bold mb-1">Stipend or Discount</label>
                  <input
                    type="text"
                    value={oppStipend}
                    onChange={(e) => setOppStipend(e.target.value)}
                    placeholder="e.g. INR 15,000/month or 25% OFF"
                    className="w-full rounded border border-[#C3CDD6] bg-[#DDE3E8]/40 px-3 py-2 text-[#1E081B] placeholder-[#5E4B5B] outline-none focus:border-[#3A0F34]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOpp}
                  className="w-full rounded bg-[#3A0F34] px-4 py-2.5 font-mono text-xs font-bold uppercase text-[#F8FAFC] hover:bg-[#240820] shadow-xs disabled:opacity-50 transition-colors"
                >
                  {isSubmittingOpp ? "Submitting..." : "Submit to Moderation Queue"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
