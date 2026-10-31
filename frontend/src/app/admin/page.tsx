"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, RefreshCw, FileText } from "lucide-react";
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
    <div className="space-y-8">
      {/* Header */}
      <div className="border border-neutral-800 bg-neutral-900/40 p-6 rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-mono text-neutral-400">
              Governance & Integrity
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-red-800/60 bg-red-950/40 text-red-400">
              Admin Session
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            City Moderation Queue
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Review submitted local listings, student opportunities, and verify authenticity for {town}.
          </p>
        </div>

        <button
          onClick={fetchModerationData}
          disabled={loading}
          className="flex items-center gap-2 border border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white px-3 py-1.5 text-xs font-mono transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Queue</span>
        </button>
      </div>

      {notice && (
        <div className="border border-neutral-700 bg-neutral-900 p-3 text-xs font-mono text-neutral-200">
          STATUS: {notice}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 gap-2">
        <button
          onClick={() => setActiveTab("listings")}
          className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "listings"
              ? "border-white text-white font-semibold"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Listings ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab("opportunities")}
          className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "opportunities"
              ? "border-white text-white font-semibold"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Opportunities ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "reports"
              ? "border-white text-white font-semibold"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          User Reports ({reports.length})
        </button>
      </div>

      {/* Tab 1: Listings Moderation */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="border border-neutral-900 p-12 text-center text-sm font-mono text-neutral-600">
              No listings currently in moderation queue.
            </div>
          ) : (
            <div className="border border-neutral-800 divide-y divide-neutral-900 bg-neutral-950">
              {listings.map((item) => (
                <div key={item.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-base">{item.name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 border border-neutral-800 text-neutral-400">
                        {item.vertical}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {item.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
                      <span>Status: <span className="text-neutral-300 uppercase">{item.moderation_status}</span></span>
                      <span>Verification: <span className="text-neutral-300 uppercase">{item.verification_status}</span></span>
                      <span>Slug: /{item.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.moderation_status !== "approved" && (
                      <button
                        onClick={() => handleModerationAction(item.id, "listing", "approved", "details_reviewed")}
                        disabled={actionLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-700 hover:border-emerald-700 bg-neutral-900 hover:bg-emerald-950/40 text-neutral-200 hover:text-emerald-300 text-xs font-mono transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Approve & Review</span>
                      </button>
                    )}
                    {item.moderation_status !== "rejected" && (
                      <button
                        onClick={() => handleModerationAction(item.id, "listing", "rejected")}
                        disabled={actionLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-800 hover:border-red-800 bg-neutral-900 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 text-xs font-mono transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                        <span>Reject</span>
                      </button>
                    )}
                    {item.verification_status !== "details_reviewed" && (
                      <button
                        onClick={() => handleModerationAction(item.id, "listing", "approved", "details_reviewed")}
                        disabled={actionLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-800 hover:border-blue-800 bg-neutral-900 hover:bg-blue-950/40 text-neutral-400 hover:text-blue-300 text-xs font-mono transition-colors"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
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
            <div className="border border-neutral-900 p-12 text-center text-sm font-mono text-neutral-600">
              No student opportunities in queue.
            </div>
          ) : (
            <div className="border border-neutral-800 divide-y divide-neutral-900 bg-neutral-950">
              {opportunities.map((opp) => (
                <div key={opp.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-base">{opp.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 border border-neutral-800 text-neutral-400">
                        {opp.opportunity_type}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-neutral-500">
                      Provider: <span className="text-neutral-300">{opp.provider_name}</span> | City: {opp.city} | Status: <span className="text-neutral-300 uppercase">{opp.moderation_status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {opp.moderation_status !== "approved" && (
                      <button
                        onClick={() => handleModerationAction(opp.id, "opportunity", "approved")}
                        disabled={actionLoading === opp.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-700 hover:border-emerald-700 bg-neutral-900 hover:bg-emerald-950/40 text-neutral-200 hover:text-emerald-300 text-xs font-mono transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Approve Opportunity</span>
                      </button>
                    )}
                    {opp.moderation_status !== "rejected" && (
                      <button
                        onClick={() => handleModerationAction(opp.id, "opportunity", "rejected")}
                        disabled={actionLoading === opp.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-800 hover:border-red-800 bg-neutral-900 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 text-xs font-mono transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
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
            <div className="border border-neutral-900 p-12 text-center text-sm font-mono text-neutral-600">
              Zero active user reports. Community records are clean.
            </div>
          ) : (
            <div className="border border-neutral-800 divide-y divide-neutral-900 bg-neutral-950">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="font-mono text-xs uppercase px-2 py-0.5 border border-amber-900/60 bg-amber-950/40 text-amber-400">
                        {rep.reason.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Reported by: {rep.reported_by_email}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 border border-neutral-800 text-neutral-400">
                        Status: {rep.status}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300 font-sans">
                      &quot;{rep.details}&quot;
                    </p>
                    <div className="text-[10px] font-mono text-neutral-500">
                      Listing ID: {rep.listing_id} | Created: {new Date(rep.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rep.status === "open" && (
                      <>
                        <button
                          onClick={() => handleReportAction(rep.id, "resolved")}
                          disabled={actionLoading === rep.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-700 hover:border-emerald-700 bg-neutral-900 hover:bg-emerald-950/40 text-neutral-200 hover:text-emerald-300 text-xs font-mono transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Resolve Issue</span>
                        </button>
                        <button
                          onClick={() => handleReportAction(rep.id, "dismissed")}
                          disabled={actionLoading === rep.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-neutral-200 text-xs font-mono transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5 text-neutral-500" />
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
  );
}
