"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { useTown } from "@/components/TownContext";

interface AdminListing {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  city: string;
  verification_status: "not_verified" | "owner_claimed" | "details_reviewed";
  moderation_status: "submitted" | "pending_review" | "approved" | "needs_changes" | "rejected";
  created_at: string;
}

interface AdminOpportunity {
  id: string;
  title: string;
  slug: string;
  opportunity_type: string;
  provider_name: string;
  city: string;
  moderation_status: "submitted" | "pending_review" | "approved" | "needs_changes" | "rejected";
  created_at: string;
}

interface AdminReport {
  id: string;
  listing_id: string;
  reported_by_email: string;
  reason: "incorrect_details" | "closed_business" | "duplicate" | "misleading";
  details: string;
  status: "open" | "resolved" | "dismissed";
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

export default function AdminGovernancePage() {
  const { town } = useTown();
  const [activeTab, setActiveTab] = useState<"listings" | "opportunities" | "reports">("listings");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchModerationData = useCallback(async () => {
    setLoading(true);
    try {
      const [modRes, repRes] = await Promise.all([
        fetch(`${API_BASE}/admin/moderation`, {
          headers: { "x-user-id": "22222222-2222-2222-2222-222222222202" },
        }),
        fetch(`${API_BASE}/admin/reports`, {
          headers: { "x-user-id": "22222222-2222-2222-2222-222222222202" },
        }),
      ]);

      if (modRes.ok) {
        const modData = await modRes.json();
        setListings(modData.listings || []);
        setOpportunities(modData.opportunities || []);
      }
      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData || []);
      }
    } catch (err) {
      console.error("Failed to load admin queue data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModerationData();
  }, [fetchModerationData]);

  const handleModerationAction = async (
    id: string,
    entity_type: "listing" | "opportunity",
    status: "approved" | "rejected" | "needs_changes",
    verification?: "details_reviewed" | "owner_claimed"
  ) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/admin/moderation/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "22222222-2222-2222-2222-222222222202",
        },
        body: JSON.stringify({
          entity_type,
          status,
          verification: verification || "details_reviewed",
          rejection_reason: status === "rejected" ? "Failed compliance criteria" : null,
        }),
      });

      if (res.ok) {
        setNotice(`Item successfully marked as ${status.toUpperCase()}.`);
        setTimeout(() => setNotice(null), 4000);
        await fetchModerationData();
      } else {
        setNotice("Failed to update item moderation status.");
      }
    } catch (err) {
      console.error("Moderation action error", err);
      setNotice("Error connecting to moderation API.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReportAction = async (id: string, status: "resolved" | "dismissed") => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/admin/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "22222222-2222-2222-2222-222222222202",
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setNotice(`Report marked as ${status.toUpperCase()}.`);
        setTimeout(() => setNotice(null), 4000);
        await fetchModerationData();
      } else {
        setNotice("Failed to update report status.");
      }
    } catch (err) {
      console.error("Report action error", err);
      setNotice("Error connecting to moderation API.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#DDE3E8]">
      {/* Imperial Plum Header */}
      <section className="border-b border-[#C3CDD6] bg-[#3A0F34] bg-grid-plum py-8 px-4 sm:px-6 shadow-sm">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-widest font-mono text-[#EAAA00] font-semibold">
                  Governance & Integrity
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#240820] border border-[#B93829] text-[#F8FAFC]">
                  Admin Session
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC] mt-1 font-mono uppercase sm:text-3xl">
                City Moderation Queue
              </h1>
              <p className="text-xs text-[#DDE3E8]/80 mt-1 font-sans">
                Review submitted local listings, student opportunities, and verify authenticity for {town}.
              </p>
            </div>

            <button
              onClick={fetchModerationData}
              disabled={loading}
              className="flex items-center gap-2 rounded bg-[#EAAA00] hover:bg-[#ffc02e] text-[#240820] px-4 py-2 text-xs font-mono font-bold uppercase transition-all shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={2} />
              <span>Sync Queue</span>
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        {notice && (
          <div className="rounded-lg border border-[#0D6E52] bg-[#F8FAFC] p-3 text-xs font-mono text-[#0D6E52] font-semibold shadow-xs">
            STATUS: {notice}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-[#C3CDD6]">
          <button
            onClick={() => setActiveTab("listings")}
            className={`rounded px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs ${
              activeTab === "listings"
                ? "bg-[#EAAA00] text-[#240820] ring-1 ring-[#240820]"
                : "bg-[#F8FAFC] text-[#5E4B5B] border border-[#C3CDD6] hover:text-[#1E081B]"
            }`}
          >
            Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab("opportunities")}
            className={`rounded px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs ${
              activeTab === "opportunities"
                ? "bg-[#EAAA00] text-[#240820] ring-1 ring-[#240820]"
                : "bg-[#F8FAFC] text-[#5E4B5B] border border-[#C3CDD6] hover:text-[#1E081B]"
            }`}
          >
            Opportunities ({opportunities.length})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`rounded px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs ${
              activeTab === "reports"
                ? "bg-[#EAAA00] text-[#240820] ring-1 ring-[#240820]"
                : "bg-[#F8FAFC] text-[#5E4B5B] border border-[#C3CDD6] hover:text-[#1E081B]"
            }`}
          >
            User Reports ({reports.length})
          </button>
        </div>

        {/* Tab 1: Listings Moderation */}
        {activeTab === "listings" && (
          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-12 text-center text-sm font-mono text-[#5E4B5B] uppercase shadow-xs">
                No listings currently in moderation queue.
              </div>
            ) : (
              <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] divide-y divide-[#C3CDD6] shadow-sm overflow-hidden">
                {listings.map((item) => (
                  <div key={item.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#DDE3E8]/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#3A0F34] text-base font-mono uppercase">{item.name}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#DDE3E8] border border-[#C3CDD6] text-[#1E081B] font-semibold">
                          {item.vertical}
                        </span>
                        <span className="text-[11px] font-mono text-[#5E4B5B]">
                          {item.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-[#5E4B5B]">
                        <span>Status: <strong className="text-[#3A0F34] uppercase">{item.moderation_status}</strong></span>
                        <span>Verification: <strong className="text-[#3A0F34] uppercase">{item.verification_status}</strong></span>
                        <span>Slug: /{item.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.moderation_status !== "approved" && (
                        <button
                          onClick={() => handleModerationAction(item.id, "listing", "approved", "details_reviewed")}
                          disabled={actionLoading === item.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0D6E52] text-white text-xs font-mono font-bold uppercase hover:bg-[#0a5841] transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                          <span>Approve & Review</span>
                        </button>
                      )}
                      {item.moderation_status !== "rejected" && (
                        <button
                          onClick={() => handleModerationAction(item.id, "listing", "rejected")}
                          disabled={actionLoading === item.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#B93829] text-white text-xs font-mono font-bold uppercase hover:bg-[#962c20] transition-colors shadow-xs"
                        >
                          <XCircle className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                          <span>Reject</span>
                        </button>
                      )}
                      {item.verification_status !== "details_reviewed" && (
                        <button
                          onClick={() => handleModerationAction(item.id, "listing", "approved", "details_reviewed")}
                          disabled={actionLoading === item.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#3A0F34] text-[#F8FAFC] text-xs font-mono font-bold uppercase hover:bg-[#240820] transition-colors shadow-xs"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-[#EAAA00]" strokeWidth={2} />
                          <span>Grant Verified</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Student Opportunities Moderation */}
        {activeTab === "opportunities" && (
          <div className="space-y-4">
            {opportunities.length === 0 ? (
              <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-12 text-center text-sm font-mono text-[#5E4B5B] uppercase shadow-xs">
                No student opportunities in queue.
              </div>
            ) : (
              <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] divide-y divide-[#C3CDD6] shadow-sm overflow-hidden">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#DDE3E8]/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#3A0F34] text-base font-mono uppercase">{opp.title}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#DDE3E8] border border-[#C3CDD6] text-[#1E081B] font-semibold">
                          {opp.opportunity_type}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[#5E4B5B]">
                        Provider: <strong className="text-[#1E081B]">{opp.provider_name}</strong> | City: {opp.city} | Status: <strong className="text-[#3A0F34] uppercase">{opp.moderation_status}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {opp.moderation_status !== "approved" && (
                        <button
                          onClick={() => handleModerationAction(opp.id, "opportunity", "approved")}
                          disabled={actionLoading === opp.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0D6E52] text-white text-xs font-mono font-bold uppercase hover:bg-[#0a5841] transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                          <span>Approve Opportunity</span>
                        </button>
                      )}
                      {opp.moderation_status !== "rejected" && (
                        <button
                          onClick={() => handleModerationAction(opp.id, "opportunity", "rejected")}
                          disabled={actionLoading === opp.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#B93829] text-white text-xs font-mono font-bold uppercase hover:bg-[#962c20] transition-colors shadow-xs"
                        >
                          <XCircle className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: User Governance Reports */}
        {activeTab === "reports" && (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-12 text-center text-sm font-mono text-[#5E4B5B] uppercase shadow-xs">
                Zero active user reports. Community records are clean.
              </div>
            ) : (
              <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] divide-y divide-[#C3CDD6] shadow-sm overflow-hidden">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#DDE3E8]/30 transition-colors">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <AlertTriangle className="h-4 w-4 text-[#B93829]" strokeWidth={2} />
                        <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-[#B93829]/10 border border-[#B93829] text-[#B93829] font-bold">
                          {rep.reason.replace("_", " ")}
                        </span>
                        <span className="text-[11px] font-mono text-[#5E4B5B]">
                          Reported by: <strong className="text-[#1E081B]">{rep.reported_by_email}</strong>
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#DDE3E8] text-[#1E081B] font-semibold">
                          Status: {rep.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#1E081B] font-sans">
                        &quot;{rep.details}&quot;
                      </p>
                      <div className="text-[10px] font-mono text-[#5E4B5B]">
                        Listing ID: {rep.listing_id} | Created: {new Date(rep.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rep.status === "open" && (
                        <>
                          <button
                            onClick={() => handleReportAction(rep.id, "resolved")}
                            disabled={actionLoading === rep.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0D6E52] text-white text-xs font-mono font-bold uppercase hover:bg-[#0a5841] transition-colors shadow-xs"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                            <span>Resolve Issue</span>
                          </button>
                          <button
                            onClick={() => handleReportAction(rep.id, "dismissed")}
                            disabled={actionLoading === rep.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#C3CDD6] bg-[#DDE3E8] text-[#5E4B5B] hover:text-[#1E081B] text-xs font-mono font-bold uppercase transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5 text-[#5E4B5B]" strokeWidth={2} />
                            <span>Dismiss</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
