"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, RefreshCw, FileText, Check, X } from "lucide-react";
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

interface AdminAuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string | null;
  actor_role: string;
  payload: Record<string, unknown>;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

export default function AdminGovernancePage() {
  const { town } = useTown();
  const [activeTab, setActiveTab] = useState<"listings" | "opportunities" | "reports" | "audit">("listings");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchModerationData = useCallback(async () => {
    setLoading(true);
    try {
      const [modRes, repRes, auditRes] = await Promise.all([
        fetch(`${API_BASE}/admin/moderation`, {
          headers: { "x-user-id": "22222222-2222-2222-2222-222222222202" },
        }),
        fetch(`${API_BASE}/admin/reports`, {
          headers: { "x-user-id": "22222222-2222-2222-2222-222222222202" },
        }),
        fetch(`${API_BASE}/admin/audit-logs`, {
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
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData || []);
      }
    } catch (err) {
      console.error("Failed to load moderation data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModerationData();
  }, [fetchModerationData]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleModerateListing = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/admin/moderate/listing/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "22222222-2222-2222-2222-222222222202",
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showNotice(`Listing ${status === "approved" ? "approved" : "rejected"} successfully.`);
        fetchModerationData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyListing = async (id: string, status: "details_reviewed" | "not_verified") => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/admin/verify/listing/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "22222222-2222-2222-2222-222222222202",
        },
        body: JSON.stringify({ verification_status: status }),
      });
      if (res.ok) {
        showNotice(`Listing verification set to ${status}.`);
        fetchModerationData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleModerateOpportunity = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/admin/moderate/opportunity/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "22222222-2222-2222-2222-222222222202",
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showNotice(`Opportunity ${status === "approved" ? "approved" : "rejected"} successfully.`);
        fetchModerationData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveReport = async (id: string, status: "resolved" | "dismissed") => {
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
        showNotice(`Report marked as ${status}.`);
        fetchModerationData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ backgroundColor: "#F4F2EE", minHeight: "100vh" }}>
      {/* Header Banner in Obsidian Carbon */}
      <section
        style={{
          backgroundColor: "#111110",
          color: "#F4F2EE",
          padding: "36px 24px",
          borderBottom: "1px solid rgba(244,242,238,0.08)",
        }}
      >
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono" style={{ fontSize: "10px", color: "rgba(244,242,238,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#FF4F17" }} />
              <span>City Governance &amp; Moderation Console</span>
              <span>/</span>
              <span style={{ color: "#FF4F17", fontWeight: 700 }}>{town} Jurisdiction</span>
            </div>
            <h1
              className="mt-1"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(26px, 3.5vw, 40px)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "#F4F2EE",
                margin: "4px 0 0",
              }}
            >
              City Admin Governance Queue
            </h1>
            <p className="font-mono text-xs mt-1.5" style={{ color: "rgba(244,242,238,0.6)" }}>
              Authenticated persona: <strong style={{ color: "#F4F2EE" }}>City Administrator</strong> (Supervised Town Verification)
            </p>
          </div>

          <button
            onClick={fetchModerationData}
            className="pressable self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded"
            style={{
              backgroundColor: "rgba(244,242,238,0.1)",
              border: "1px solid rgba(244,242,238,0.15)",
              color: "#F4F2EE",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              cursor: "pointer",
            }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={2} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
        {/* Floating Notification */}
        {notice && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded animate-modal-enter"
            style={{
              backgroundColor: "#ECFDF5",
              border: "1px solid rgba(13,104,71,0.3)",
              color: "#0D6847",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            <span>{notice}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div
          className="flex items-center gap-1 p-1 rounded"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D3C8" }}
        >
          {[
            { id: "listings" as const, label: `Pending Listings (${listings.length})` },
            { id: "opportunities" as const, label: `Student Opportunities (${opportunities.length})` },
            { id: "reports" as const, label: `Citizen Reports (${reports.length})` },
            { id: "audit" as const, label: `Audit Trail (${auditLogs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="pressable px-4 py-2 rounded font-mono text-xs uppercase"
              style={{
                fontWeight: 700,
                letterSpacing: "0.04em",
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === tab.id ? "#111110" : "transparent",
                color: activeTab === tab.id ? "#F4F2EE" : "#575551",
                transition: "all 140ms ease-out",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listings Queue */}
        {activeTab === "listings" && (
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D3C8", borderRadius: "8px", overflow: "hidden" }}>
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid #D8D3C8", backgroundColor: "#F0EDE8" }}
            >
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: "#111110" }}>
                Directory Submissions &amp; Verification Requests
              </h3>
              <span className="font-mono text-[10px]" style={{ color: "#8B877F" }}>
                Town: {town}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center font-mono text-xs" style={{ color: "#8B877F" }}>
                Loading moderation items...
              </div>
            ) : listings.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs" style={{ color: "#8B877F" }}>
                All listings in moderation queue have been processed.
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#D8D3C8" }}>
                {listings.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold truncate" style={{ color: "#111110" }}>
                          {item.name}
                        </span>
                        <span
                          className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                          style={{ backgroundColor: "#EAE6DF", color: "#575551" }}
                        >
                          {item.vertical}
                        </span>
                        <span
                          className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                          style={{
                            backgroundColor: item.verification_status === "details_reviewed" ? "#ECFDF5" : "#FFFBEB",
                            color: item.verification_status === "details_reviewed" ? "#0D6847" : "#D97706",
                            border: `1px solid ${item.verification_status === "details_reviewed" ? "rgba(13,104,71,0.2)" : "rgba(217,119,6,0.2)"}`,
                          }}
                        >
                          {item.verification_status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-xs" style={{ color: "#8B877F" }}>
                        <span>City: {item.city}</span>
                        <span>•</span>
                        <span>Status: <strong style={{ color: "#111110" }}>{item.moderation_status}</strong></span>
                        <span>•</span>
                        <span className="font-mono-numbers">{item.created_at.slice(0, 10)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => handleModerateListing(item.id, "approved")}
                        disabled={actionLoading === item.id}
                        className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold uppercase"
                        style={{
                          backgroundColor: "#0D6847",
                          color: "#FFFFFF",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleModerateListing(item.id, "rejected")}
                        disabled={actionLoading === item.id}
                        className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold uppercase"
                        style={{
                          backgroundColor: "transparent",
                          color: "#FF4F17",
                          border: "1px solid #FF4F17",
                          cursor: "pointer",
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>

                      {item.verification_status !== "details_reviewed" ? (
                        <button
                          onClick={() => handleVerifyListing(item.id, "details_reviewed")}
                          disabled={actionLoading === item.id}
                          className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold uppercase"
                          style={{
                            backgroundColor: "#111110",
                            color: "#F4F2EE",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Assign Verified Badge</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerifyListing(item.id, "not_verified")}
                          disabled={actionLoading === item.id}
                          className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold uppercase"
                          style={{
                            backgroundColor: "#EAE6DF",
                            color: "#575551",
                            border: "1px solid #D8D3C8",
                            cursor: "pointer",
                          }}
                        >
                          <span>Revoke Verified</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Opportunities Queue */}
        {activeTab === "opportunities" && (
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D3C8", borderRadius: "8px", overflow: "hidden" }}>
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid #D8D3C8", backgroundColor: "#F0EDE8" }}
            >
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: "#111110" }}>
                Student Opportunities &amp; Offer Submissions
              </h3>
              <span className="font-mono text-[10px]" style={{ color: "#8B877F" }}>
                Anti-Scam Verified
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center font-mono text-xs" style={{ color: "#8B877F" }}>
                Loading opportunities...
              </div>
            ) : opportunities.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs" style={{ color: "#8B877F" }}>
                No opportunities pending moderation review.
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#D8D3C8" }}>
                {opportunities.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold truncate" style={{ color: "#111110" }}>
                          {item.title}
                        </span>
                        <span
                          className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                          style={{ backgroundColor: "#FFFBEB", color: "#D97706", border: "1px solid rgba(217,119,6,0.25)" }}
                        >
                          {item.opportunity_type.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 font-mono text-xs" style={{ color: "#8B877F" }}>
                        <span>Provider: <strong style={{ color: "#111110" }}>{item.provider_name}</strong></span>
                        <span>•</span>
                        <span>City: {item.city}</span>
                        <span>•</span>
                        <span>Status: <strong style={{ color: "#111110" }}>{item.moderation_status}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleModerateOpportunity(item.id, "approved")}
                        disabled={actionLoading === item.id}
                        className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold uppercase"
                        style={{
                          backgroundColor: "#0D6847",
                          color: "#FFFFFF",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleModerateOpportunity(item.id, "rejected")}
                        disabled={actionLoading === item.id}
                        className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold uppercase"
                        style={{
                          backgroundColor: "transparent",
                          color: "#FF4F17",
                          border: "1px solid #FF4F17",
                          cursor: "pointer",
                        }}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports Queue */}
        {activeTab === "reports" && (
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D3C8", borderRadius: "8px", overflow: "hidden" }}>
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid #D8D3C8", backgroundColor: "#F0EDE8" }}
            >
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: "#111110" }}>
                Citizen Issue Reports &amp; Inaccuracy Flagging
              </h3>
              <span className="font-mono text-[10px]" style={{ color: "#8B877F" }}>
                Consumer Protection
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center font-mono text-xs" style={{ color: "#8B877F" }}>
                Loading citizen reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs" style={{ color: "#8B877F" }}>
                No citizen reports registered.
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#D8D3C8" }}>
                {reports.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                          style={{ backgroundColor: "rgba(255,79,23,0.1)", color: "#FF4F17", border: "1px solid rgba(255,79,23,0.2)" }}
                        >
                          {item.reason.replace("_", " ")}
                        </span>
                        <span
                          className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                          style={{
                            backgroundColor: item.status === "open" ? "#FFFBEB" : "#ECFDF5",
                            color: item.status === "open" ? "#D97706" : "#0D6847",
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="font-sans text-xs" style={{ color: "#111110" }}>
                        {item.details}
                      </p>
                      <div className="flex items-center gap-4 font-mono text-xs" style={{ color: "#8B877F" }}>
                        <span>Reported by: {item.reported_by_email || "Anonymous"}</span>
                        <span>•</span>
                        <span className="font-mono-numbers">{item.created_at.slice(0, 10)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveReport(item.id, "resolved")}
                        disabled={actionLoading === item.id}
                        className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold uppercase"
                        style={{
                          backgroundColor: "#0D6847",
                          color: "#FFFFFF",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Resolve</span>
                      </button>

                      <button
                        onClick={() => handleResolveReport(item.id, "dismissed")}
                        disabled={actionLoading === item.id}
                        className="pressable flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold uppercase"
                        style={{
                          backgroundColor: "transparent",
                          color: "#575551",
                          border: "1px solid #D8D3C8",
                          cursor: "pointer",
                        }}
                      >
                        <span>Dismiss</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Governance Audit Trail */}
        {activeTab === "audit" && (
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D3C8", borderRadius: "8px", overflow: "hidden" }}>
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid #D8D3C8", backgroundColor: "#F0EDE8" }}
            >
              <div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: "#111110" }}>
                  Immutable Governance Audit Trail
                </h3>
                <p className="font-mono text-[11px] text-[#575551] mt-0.5">
                  Async background worker event stream: enquiries, lead updates, and moderation actions
                </p>
              </div>
              <span className="font-mono text-[10px] text-[#8B877F] uppercase">
                Worker Capacity: 100 Jobs
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center font-mono text-xs" style={{ color: "#8B877F" }}>
                Loading audit trail events...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs" style={{ color: "#8B877F" }}>
                No audit events recorded yet. Enqueue enquiries or moderation actions to view entries.
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#D8D3C8" }}>
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-[#F4F2EE]/40 transition-colors"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                          style={{ backgroundColor: "#111110", color: "#F4F2EE" }}
                        >
                          {log.entity_type}
                        </span>
                        <span
                          className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                          style={{
                            backgroundColor: log.action.includes("approved") || log.action.includes("created")
                              ? "#ECFDF5"
                              : "#FFFBEB",
                            color: log.action.includes("approved") || log.action.includes("created")
                              ? "#0D6847"
                              : "#D97706",
                            border: "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          {log.action}
                        </span>
                        <span className="font-mono text-[11px] text-[#575551]">
                          Actor: <strong>{log.actor_role}</strong>
                          {log.actor_id ? ` (${log.actor_id.slice(0, 8)})` : " (System / Resident)"}
                        </span>
                      </div>

                      <div className="rounded bg-[#F4F2EE] border border-[#D8D3C8] p-2.5 font-mono text-[11px] text-[#111110] overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.payload, null, 2)}</pre>
                      </div>

                      <div className="flex items-center gap-4 font-mono text-[10px] text-[#8B877F]">
                        <span>Entity ID: {log.entity_id}</span>
                        <span>•</span>
                        <span>Log ID: {log.id}</span>
                      </div>
                    </div>

                    <div className="font-mono text-xs text-[#575551] shrink-0 text-right">
                      <p className="font-bold text-[#111110]">{new Date(log.created_at).toLocaleTimeString()}</p>
                      <p className="text-[10px] text-[#8B877F]">{new Date(log.created_at).toLocaleDateString()}</p>
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
