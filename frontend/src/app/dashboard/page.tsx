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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Header with Demo Tenant Persona Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
            Multi-Tenant SaaS Portal
          </div>
          <h1 className="font-mono text-2xl font-bold uppercase text-neutral-100 sm:text-3xl">
            {metrics?.organization_name || "Tenant Dashboard"}
          </h1>
          <div className="mt-1 flex items-center gap-2 font-mono text-xs text-neutral-400">
            <span>Location: {metrics?.city || "Nellore"}</span>
            <span>|</span>
            <span>Plan: <strong className="text-white uppercase">{metrics?.plan_name}</strong></span>
          </div>
        </div>

        {/* Persona Switcher */}
        <div className="flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900/80 p-1.5 self-start sm:self-auto">
          <span className="font-mono text-[10px] text-neutral-400 uppercase px-2">
            Test Persona:
          </span>
          <button
            onClick={() => setTenantPersona("education")}
            className={`rounded px-3 py-1 font-mono text-xs uppercase font-medium transition-colors ${
              tenantPersona === "education"
                ? "bg-neutral-100 text-neutral-950 font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Education Tenant
          </button>
          <button
            onClick={() => setTenantPersona("business")}
            className={`rounded px-3 py-1 font-mono text-xs uppercase font-medium transition-colors ${
              tenantPersona === "business"
                ? "bg-neutral-100 text-neutral-950 font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Business Tenant
          </button>
        </div>
      </div>

      {planMessage && (
        <div className="my-4 rounded border border-neutral-700 bg-neutral-900 p-3 font-mono text-xs text-neutral-200 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-white" />
          <span>{planMessage}</span>
        </div>
      )}

      {/* Telemetry Metric Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Views */}
        <div className="rounded border border-neutral-800 bg-neutral-900/30 p-5">
          <div className="flex items-center justify-between text-neutral-400 font-mono text-xs uppercase">
            <span>Total Profile Views</span>
            <Eye className="h-4 w-4" />
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-neutral-100 font-mono-numbers">
            {metrics?.total_views || 0}
          </div>
          <div className="mt-1 font-mono text-[10px] text-neutral-500 uppercase">
            Organic discovery traffic
          </div>
        </div>

        {/* WhatsApp Actions */}
        <div className="rounded border border-neutral-800 bg-neutral-900/30 p-5">
          <div className="flex items-center justify-between text-neutral-400 font-mono text-xs uppercase">
            <span>WhatsApp Clicks</span>
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-neutral-100 font-mono-numbers">
            {metrics?.total_whatsapp_clicks || 0}
          </div>
          <div className="mt-1 font-mono text-[10px] text-neutral-500 uppercase">
            Direct chat inquiries
          </div>
        </div>

        {/* Phone Calls */}
        <div className="rounded border border-neutral-800 bg-neutral-900/30 p-5">
          <div className="flex items-center justify-between text-neutral-400 font-mono text-xs uppercase">
            <span>Phone Inquiries</span>
            <Phone className="h-4 w-4" />
          </div>
          <div className="mt-3 font-mono text-2xl font-bold text-neutral-100 font-mono-numbers">
            {metrics?.total_call_clicks || 0}
          </div>
          <div className="mt-1 font-mono text-[10px] text-neutral-500 uppercase">
            Direct telephone clicks
          </div>
        </div>

        {/* Monthly Lead Quota */}
        <div className="rounded border border-neutral-800 bg-neutral-900/30 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 font-mono text-xs uppercase">
              <span>Monthly Lead Quota</span>
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="mt-3 font-mono text-xl font-bold text-neutral-100 font-mono-numbers">
              {metrics?.leads_used_this_month || 0} / {metrics?.monthly_lead_quota || 5}
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full rounded bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-neutral-100 transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    ((metrics?.leads_used_this_month || 0) / (metrics?.monthly_lead_quota || 1)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className="mt-2 font-mono text-[10px] text-neutral-500 uppercase">
            Resets on 1st of next month
          </div>
        </div>
      </div>

      {/* Plan Simulator Ribbon */}
      <div className="mt-8 rounded border border-neutral-800 bg-neutral-900/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase text-white">
              SaaS Plan Entitlement Simulator
            </span>
            <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-[10px] text-neutral-300 uppercase">
              Active: {metrics?.plan_tier}
            </span>
          </div>
          <p className="mt-1 font-sans text-xs text-neutral-400">
            Test SaaS plan lead unlocking. Quotas increase dynamically without restarting services.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => simulatePlanUpgrade("free")}
            className="rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1 font-mono text-xs text-neutral-300 hover:bg-neutral-800 uppercase"
          >
            Free (5)
          </button>
          <button
            onClick={() => simulatePlanUpgrade("growth_business")}
            className="rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1 font-mono text-xs text-neutral-300 hover:bg-neutral-800 uppercase"
          >
            Growth (25)
          </button>
          <button
            onClick={() => simulatePlanUpgrade("edu_pro")}
            className="rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1 font-mono text-xs text-neutral-300 hover:bg-neutral-800 uppercase"
          >
            Edu Pro (50)
          </button>
          <button
            onClick={() => simulatePlanUpgrade("campus_enterprise")}
            className="rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1 font-mono text-xs text-neutral-300 hover:bg-neutral-800 uppercase"
          >
            Enterprise (200)
          </button>
        </div>
      </div>

      {/* Two Column Section: Leads Inbox + Publish Opportunity */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leads Inbox (2 Cols) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-neutral-300" />
              <h2 className="font-mono text-sm font-bold uppercase text-neutral-100">
                Actionable Lead Inbox ({leads.length})
              </h2>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveLeadFilter("all")}
                className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase ${
                  activeLeadFilter === "all"
                    ? "bg-neutral-100 text-neutral-950 font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveLeadFilter("open")}
                className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase ${
                  activeLeadFilter === "open"
                    ? "bg-neutral-100 text-neutral-950 font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setActiveLeadFilter("responded")}
                className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase ${
                  activeLeadFilter === "responded"
                    ? "bg-neutral-100 text-neutral-950 font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Responded
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center font-mono text-xs text-neutral-500 uppercase">
              Loading leads inbox...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="rounded border border-neutral-800 bg-neutral-900/20 py-10 text-center font-mono text-xs text-neutral-400 uppercase">
              No leads currently matching filter criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded border border-neutral-800 bg-neutral-900/30 p-4 flex flex-col justify-between"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/60 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white uppercase">
                        {lead.inquirer_name}
                      </span>
                      <span className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[9px] text-neutral-300 uppercase">
                        {lead.enquiry_type.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-neutral-500 font-mono-numbers">
                        {new Date(lead.created_at).toISOString().split("T")[0]}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                          lead.status === "open"
                            ? "bg-amber-950 border border-amber-800/60 text-amber-300"
                            : "bg-neutral-800 text-neutral-300"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-neutral-300 my-2">{lead.message}</p>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800/60 pt-2 font-mono text-[11px] text-neutral-400">
                    <div className="flex items-center gap-3">
                      <span>Phone: <strong className="text-white">{lead.inquirer_phone}</strong></span>
                      {lead.inquirer_email && <span>Email: {lead.inquirer_email}</span>}
                    </div>

                    <button
                      onClick={() => toggleLeadStatus(lead.id, lead.status)}
                      className="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 font-mono text-[10px] font-semibold text-white hover:bg-neutral-700 uppercase"
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
          <div className="border-b border-neutral-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-neutral-300" />
              <h2 className="font-mono text-sm font-bold uppercase text-neutral-100">
                Post Opportunity
              </h2>
            </div>
          </div>

          <div className="rounded border border-neutral-800 bg-neutral-900/30 p-5">
            {oppSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded border border-neutral-700 bg-neutral-900 p-3 font-mono text-xs text-neutral-200">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>{oppSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateOpportunity} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-neutral-400 uppercase mb-1">Opportunity Type</label>
                <select
                  value={oppType}
                  onChange={(e) => setOppType(e.target.value)}
                  className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-500"
                >
                  <option value="internship">Internship / Apprenticeship</option>
                  <option value="scholarship">Scholarship / Merit Aid</option>
                  <option value="hackathon">Hackathon / Campus Fair</option>
                  <option value="student_hostel">Verified Student Hostel</option>
                  <option value="student_discount">Student Discount Privilege</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  value={oppTitle}
                  onChange={(e) => setOppTitle(e.target.value)}
                  placeholder="e.g. AI & Robotics Summer Internship"
                  className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Description *</label>
                <textarea
                  value={oppDesc}
                  onChange={(e) => setOppDesc(e.target.value)}
                  rows={3}
                  placeholder="Program overview, deliverables, and guidance..."
                  className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  value={oppEligibility}
                  onChange={(e) => setOppEligibility(e.target.value)}
                  placeholder="e.g. 3rd/4th year CSE / ECE students"
                  className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase mb-1">Stipend or Discount</label>
                <input
                  type="text"
                  value={oppStipend}
                  onChange={(e) => setOppStipend(e.target.value)}
                  placeholder="e.g. INR 15,000/month or 25% OFF"
                  className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingOpp}
                className="w-full rounded bg-neutral-100 px-4 py-2 font-mono text-xs font-bold uppercase text-neutral-950 hover:bg-white disabled:opacity-50"
              >
                {isSubmittingOpp ? "Submitting..." : "Submit to Moderation Queue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
