"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  FileText,
  Check,
  X,
  Layers,
  Lock,
  Flag,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
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

interface AdminNews {
  id: string;
  title: string;
  slug: string;
  item_type: string;
  city: string;
  source_name: string;
  source_url: string;
  is_confirmed_fact: boolean;
  moderation_status: "submitted" | "pending_review" | "approved" | "needs_changes" | "rejected";
  created_at: string;
}

interface AdminClaim {
  id: string;
  listing_id: string;
  claimant_user_id: string;
  organization_name: string;
  official_email: string;
  official_phone: string;
  verification_evidence: string;
  status: "submitted" | "pending_review" | "approved" | "needs_changes" | "rejected";
  reviewed_by: string | null;
  review_notes: string | null;
  created_at: string;
}

interface AdminCategoryExtension {
  id: string;
  requested_by: string;
  vertical: string;
  proposed_name: string;
  justification: string;
  status: "submitted" | "pending_review" | "approved" | "needs_changes" | "rejected";
  reviewed_by: string | null;
  review_notes: string | null;
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
  const [activeTab, setActiveTab] = useState<"moderation" | "claims" | "categories" | "reports" | "audit">("moderation");

  const [listings, setListings] = useState<AdminListing[]>([]);
  const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([]);
  const [news, setNews] = useState<AdminNews[]>([]);
  const [claims, setClaims] = useState<AdminClaim[]>([]);
  const [categoryRequests, setCategoryRequests] = useState<AdminCategoryExtension[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchGovernanceData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const headers = {
        "x-user-id": "22222222-2222-2222-2222-222222222202",
      };

      const [modRes, claimsRes, catRes, repRes, auditRes] = await Promise.all([
        fetch(`${API_BASE}/admin/moderation`, { headers, credentials: "include", signal }),
        fetch(`${API_BASE}/admin/claims`, { headers, credentials: "include", signal }),
        fetch(`${API_BASE}/categories/extensions`, { headers, credentials: "include", signal }),
        fetch(`${API_BASE}/admin/reports`, { headers, credentials: "include", signal }),
        fetch(`${API_BASE}/admin/audit-logs`, { headers, credentials: "include", signal }),
      ]);

      if (signal?.aborted) return;

      if (modRes.ok) {
        const modData = await modRes.json();
        setListings(modData.listings || []);
        setOpportunities(modData.opportunities || []);
        setNews(modData.news || []);
      }
      if (claimsRes.ok) {
        const claimsData = await claimsRes.json();
        setClaims(claimsData || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategoryRequests(catData || []);
      }
      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData || []);
      }
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData || []);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Failed to load governance data:", err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    fetchGovernanceData(abortController.signal);
    return () => abortController.abort();
  }, [fetchGovernanceData]);

  // Action: Moderate Listing
  const handleModerateListing = async (
    id: string,
    status: "approved" | "rejected",
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
        credentials: "include",
        body: JSON.stringify({
          entity_type: "listing",
          status,
          verification: status === "approved" ? verification || "details_reviewed" : undefined,
          rejection_reason: status === "rejected" ? "Did not meet civic editorial criteria" : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to update listing moderation");
      toast.success(`Listing ${status === "approved" ? "approved" : "rejected"}`);
      fetchGovernanceData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error actioning listing");
    } finally {
      setActionLoading(null);
    }
  };

  // Action: Moderate News
  const handleModerateNews = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/admin/moderation/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "22222222-2222-2222-2222-222222222202",
        },
        credentials: "include",
        body: JSON.stringify({
          entity_type: "news",
          status,
        }),
      });

      if (!res.ok) throw new Error("Failed to update news status");
      toast.success(`Town update ${status === "approved" ? "approved & published" : "rejected"}`);
      fetchGovernanceData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error actioning news");
    } finally {
      setActionLoading(null);
    }
  };

  // Action: Action Claim
  const handleActionClaim = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    const notes = prompt(
      status === "approved"
        ? "Verification audit notes (e.g. GSTIN and telephone callback confirmed):"
        : "Rejection reason for claimant:"
    );
    if (notes === null) {
      setActionLoading(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/claims/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "22222222-2222-2222-2222-222222222202",
        },
        credentials: "include",
        body: JSON.stringify({
          status,
          review_notes: notes || (status === "approved" ? "Credentials audited and approved" : "Insufficient proof"),
        }),
      });

      if (!res.ok) throw new Error("Failed to action claim");
      toast.success(
        status === "approved"
          ? "Ownership claim approved. Tenant owner assigned and listing badge updated to OWNER CLAIMED."
          : "Ownership claim rejected."
      );
      fetchGovernanceData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error actioning claim");
    } finally {
      setActionLoading(null);
    }
  };

  // Action: Action Category Extension
  const handleActionCategory = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/admin/categories/extensions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "22222222-2222-2222-2222-222222222202",
        },
        credentials: "include",
        body: JSON.stringify({
          status,
          review_notes: status === "approved" ? "Approved for directory inclusion" : "Outside core 4 verticals",
        }),
      });

      if (!res.ok) throw new Error("Failed to action category extension");
      toast.success(`Category request ${status}`);
      fetchGovernanceData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error actioning request");
    } finally {
      setActionLoading(null);
    }
  };

  // Action: Resolve Report
  const handleResolveReport = async (id: string, status: "resolved" | "dismissed") => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/admin/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "22222222-2222-2222-2222-222222222202",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update report status");
      toast.success(`Report ${status}`);
      fetchGovernanceData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error resolving report");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[var(--border-grid)] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--ink-primary)] text-white">
                City Admin Console
              </span>
              <span className="font-mono text-xs text-[var(--ink-secondary)]">
                Jurisdiction: <strong className="text-[var(--ink-primary)]">{town}</strong>
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[var(--ink-primary)]">
              Civic Governance & Moderation Desk
            </h1>
          </div>

          <button
            onClick={() => fetchGovernanceData()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] font-mono text-xs text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--ink-primary)] transition-all shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh All Queues</span>
          </button>
        </div>

        {/* 5 Dedicated Governance Tabs */}
        <div className="flex border-b border-[var(--border-grid)] bg-[var(--bg-surface)] rounded-t-lg overflow-x-auto mb-6">
          <button
            onClick={() => setActiveTab("moderation")}
            className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "moderation"
                ? "border-[var(--accent-signal)] text-[var(--ink-primary)] bg-[var(--bg-muted)]/40"
                : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>01 / Listings & News ({listings.length + news.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("claims")}
            className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "claims"
                ? "border-[var(--accent-signal)] text-[var(--ink-primary)] bg-[var(--bg-muted)]/40"
                : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>02 / Ownership Claims ({claims.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "categories"
                ? "border-[var(--accent-signal)] text-[var(--ink-primary)] bg-[var(--bg-muted)]/40"
                : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>03 / Category Requests ({categoryRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "reports"
                ? "border-[var(--accent-signal)] text-[var(--ink-primary)] bg-[var(--bg-muted)]/40"
                : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>04 / Citizen Reports ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "audit"
                ? "border-[var(--accent-signal)] text-[var(--ink-primary)] bg-[var(--bg-muted)]/40"
                : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>05 / Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* TAB 01: PENDING LISTINGS & NEWS */}
        {activeTab === "moderation" && (
          <div className="space-y-6">
            {/* Listings Queue */}
            <div className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[var(--bg-muted)]/60 border-b border-[var(--border-grid)] flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-primary)]">
                  Directory Listing Submissions ({listings.length})
                </h3>
                <span className="font-mono text-[10px] text-[var(--ink-secondary)] uppercase">
                  Education & Business Only
                </span>
              </div>

              {listings.length === 0 ? (
                <div className="py-12 text-center font-mono text-xs text-[var(--ink-secondary)]">
                  No listings pending review.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-grid)]">
                  {listings.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-muted)]/20 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[var(--bg-muted)] border border-[var(--border-grid)] text-[var(--ink-primary)]">
                            {item.vertical}
                          </span>
                          <span className="font-mono text-xs text-[var(--ink-secondary)]">
                            {item.city}
                          </span>
                          <span className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                            {item.moderation_status}
                          </span>
                        </div>
                        <h4 className="font-serif text-lg font-medium text-[var(--ink-primary)]">
                          {item.name}
                        </h4>
                        <div className="font-mono text-xs text-[var(--ink-secondary)]">
                          <span>Slug: {item.slug}</span> • <span>Submitted: {item.created_at.slice(0, 10)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleModerateListing(item.id, "approved", "details_reviewed")}
                          disabled={actionLoading === item.id}
                          className="px-3.5 py-1.5 rounded bg-emerald-800 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-emerald-900 transition-colors disabled:opacity-50"
                        >
                          Approve (Fact Checked)
                        </button>
                        <button
                          onClick={() => handleModerateListing(item.id, "rejected")}
                          disabled={actionLoading === item.id}
                          className="px-3 py-1.5 rounded border border-[var(--accent-signal)] text-[var(--accent-signal)] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[var(--accent-signal)] hover:text-white transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* News & Civic Updates Queue */}
            <div className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[var(--bg-muted)]/60 border-b border-[var(--border-grid)] flex items-center justify-between">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-primary)]">
                  Town News & Civic Development Updates ({news.length})
                </h3>
                <span className="font-mono text-[10px] text-[var(--ink-secondary)] uppercase">
                  Mandatory Source Link Verification
                </span>
              </div>

              {news.length === 0 ? (
                <div className="py-12 text-center font-mono text-xs text-[var(--ink-secondary)]">
                  No town updates in queue.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-grid)]">
                  {news.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-muted)]/20 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[var(--bg-muted)] border border-[var(--border-grid)] text-[var(--ink-primary)]">
                            {item.item_type}
                          </span>
                          <span className="font-mono text-xs text-[var(--ink-secondary)]">
                            {item.city}
                          </span>
                          <span className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                            {item.moderation_status}
                          </span>
                          {item.is_confirmed_fact ? (
                            <span className="font-mono text-[10px] text-emerald-800 font-bold uppercase">Fact</span>
                          ) : (
                            <span className="font-mono text-[10px] text-amber-800 font-bold uppercase">Proposal</span>
                          )}
                        </div>
                        <h4 className="font-serif text-lg font-medium text-[var(--ink-primary)]">
                          {item.title}
                        </h4>
                        <div className="font-mono text-xs text-[var(--ink-secondary)] flex items-center gap-3">
                          <span>Source: {item.source_name}</span>
                          {item.source_url && (
                            <a
                              href={item.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--accent-signal)] hover:underline inline-flex items-center gap-1"
                            >
                              <span>Verify Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleModerateNews(item.id, "approved")}
                          disabled={actionLoading === item.id}
                          className="px-3.5 py-1.5 rounded bg-emerald-800 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-emerald-900 transition-colors disabled:opacity-50"
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => handleModerateNews(item.id, "rejected")}
                          disabled={actionLoading === item.id}
                          className="px-3 py-1.5 rounded border border-[var(--accent-signal)] text-[var(--accent-signal)] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[var(--accent-signal)] hover:text-white transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 02: OWNERSHIP CLAIMS QUEUE */}
        {activeTab === "claims" && (
          <div className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-[var(--bg-muted)]/60 border-b border-[var(--border-grid)] flex items-center justify-between">
              <div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-primary)]">
                  Directory Profile Ownership Claims ({claims.length})
                </h3>
                <p className="font-mono text-[11px] text-[var(--ink-secondary)] mt-0.5">
                  Approval auto-assigns tenant_owner role and promotes listing verification to OWNER CLAIMED
                </p>
              </div>
              <span className="font-mono text-[10px] text-emerald-800 uppercase font-bold">
                RBAC Gated
              </span>
            </div>

            {claims.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-[var(--ink-secondary)]">
                No ownership claims submitted.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-grid)]">
                {claims.map((claim) => (
                  <div key={claim.id} className="p-6 hover:bg-[var(--bg-muted)]/20 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              claim.status === "approved"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : claim.status === "rejected"
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {claim.status}
                          </span>
                          <span className="font-mono text-xs text-[var(--ink-secondary)]">
                            Claim ID: {claim.id.slice(0, 13)}...
                          </span>
                          <span className="font-mono text-xs text-[var(--ink-secondary)]">
                            Submitted: {claim.created_at.slice(0, 10)}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-serif text-xl font-medium text-[var(--ink-primary)]">
                            {claim.organization_name}
                          </h4>
                          <p className="font-mono text-xs text-[var(--ink-secondary)] mt-1">
                            Listing Reference: <span className="text-[var(--ink-primary)] font-semibold">{claim.listing_id}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded bg-[var(--bg-muted)]/50 border border-[var(--border-grid)] font-mono text-xs">
                          <div>
                            <span className="text-[10px] uppercase text-[var(--ink-secondary)] block">Official Email</span>
                            <span className="font-semibold text-[var(--ink-primary)]">{claim.official_email}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase text-[var(--ink-secondary)] block">Official Phone</span>
                            <span className="font-semibold text-[var(--ink-primary)]">{claim.official_phone}</span>
                          </div>
                        </div>

                        <div>
                          <span className="font-mono text-[10px] uppercase text-[var(--ink-secondary)] block mb-1">
                            Claimant Verification Evidence:
                          </span>
                          <p className="p-3 rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] text-xs text-[var(--ink-primary)] font-sans leading-relaxed whitespace-pre-line">
                            {claim.verification_evidence}
                          </p>
                        </div>

                        {claim.review_notes && (
                          <div className="font-mono text-xs text-[var(--ink-secondary)]">
                            Admin Notes: <span className="text-[var(--ink-primary)]">{claim.review_notes}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                        {claim.status === "pending_review" ? (
                          <>
                            <button
                              onClick={() => handleActionClaim(claim.id, "approved")}
                              disabled={actionLoading === claim.id}
                              className="px-4 py-2 rounded bg-emerald-800 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-emerald-900 transition-colors disabled:opacity-50"
                            >
                              Approve Claim
                            </button>
                            <button
                              onClick={() => handleActionClaim(claim.id, "rejected")}
                              disabled={actionLoading === claim.id}
                              className="px-4 py-2 rounded border border-[var(--accent-signal)] text-[var(--accent-signal)] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[var(--accent-signal)] hover:text-white transition-colors disabled:opacity-50"
                            >
                              Reject Claim
                            </button>
                          </>
                        ) : (
                          <span className="font-mono text-xs text-[var(--ink-secondary)] italic">
                            Actioned ({claim.status})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 03: CATEGORY EXTENSION REQUESTS */}
        {activeTab === "categories" && (
          <div className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-[var(--bg-muted)]/60 border-b border-[var(--border-grid)] flex items-center justify-between">
              <div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-primary)]">
                  Subcategory Extension Requests ({categoryRequests.length})
                </h3>
                <p className="font-mono text-[11px] text-[var(--ink-secondary)] mt-0.5">
                  Contributor suggestions for expanding directory taxonomy within 4 core verticals
                </p>
              </div>
              <span className="font-mono text-[10px] text-[var(--ink-secondary)] uppercase">
                Taxonomy Governance
              </span>
            </div>

            {categoryRequests.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-[var(--ink-secondary)]">
                No category requests pending.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-grid)]">
                {categoryRequests.map((req) => (
                  <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-muted)]/20 transition-colors">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[var(--bg-muted)] border border-[var(--border-grid)] text-[var(--ink-primary)]">
                          {req.vertical}
                        </span>
                        <span
                          className={`font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            req.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : req.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <h4 className="font-serif text-lg font-medium text-[var(--ink-primary)]">
                        {req.proposed_name}
                      </h4>
                      <p className="text-xs text-[var(--ink-secondary)] font-sans leading-relaxed">
                        {req.justification}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === "pending_review" ? (
                        <>
                          <button
                            onClick={() => handleActionCategory(req.id, "approved")}
                            disabled={actionLoading === req.id}
                            className="px-3.5 py-1.5 rounded bg-emerald-800 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-emerald-900 transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleActionCategory(req.id, "rejected")}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1.5 rounded border border-[var(--accent-signal)] text-[var(--accent-signal)] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[var(--accent-signal)] hover:text-white transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="font-mono text-xs text-[var(--ink-secondary)]">
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 04: CITIZEN ISSUE REPORTS */}
        {activeTab === "reports" && (
          <div className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-[var(--bg-muted)]/60 border-b border-[var(--border-grid)] flex items-center justify-between">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-primary)]">
                Citizen Issue Reports & Inaccuracy Flagging ({reports.length})
              </h3>
              <span className="font-mono text-[10px] text-[var(--ink-secondary)] uppercase">
                Consumer Protection
              </span>
            </div>

            {reports.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-[var(--ink-secondary)]">
                No citizen reports registered.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-grid)]">
                {reports.map((item) => (
                  <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-muted)]/20 transition-colors">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {item.reason.replace("_", " ")}
                        </span>
                        <span
                          className={`font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            item.status === "open" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-[var(--ink-primary)]">
                        {item.details}
                      </p>
                      <div className="flex items-center gap-4 font-mono text-xs text-[var(--ink-secondary)]">
                        <span>Reported by: {item.reported_by_email || "Anonymous"}</span>
                        <span>•</span>
                        <span>{item.created_at.slice(0, 10)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleResolveReport(item.id, "resolved")}
                        disabled={actionLoading === item.id}
                        className="px-3.5 py-1.5 rounded bg-emerald-800 text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-emerald-900 transition-colors disabled:opacity-50"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleResolveReport(item.id, "dismissed")}
                        disabled={actionLoading === item.id}
                        className="px-3 py-1.5 rounded border border-[var(--border-grid)] font-mono text-xs text-[var(--ink-secondary)] hover:border-[var(--ink-primary)] transition-colors disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 05: IMMUTABLE AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-[var(--bg-muted)]/60 border-b border-[var(--border-grid)] flex items-center justify-between">
              <div>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink-primary)]">
                  Immutable Governance Audit Trail ({auditLogs.length})
                </h3>
                <p className="font-mono text-[11px] text-[var(--ink-secondary)] mt-0.5">
                  Async bounded worker event stream: enquiries, lead updates, claims, and moderation actions
                </p>
              </div>
              <span className="font-mono text-[10px] text-[var(--ink-secondary)] uppercase">
                Worker Capacity: 100 Jobs
              </span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-[var(--ink-secondary)]">
                No audit events recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-grid)]">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-[var(--bg-muted)]/20 transition-colors">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[var(--ink-primary)] text-white">
                          {log.entity_type}
                        </span>
                        <span className="font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {log.action}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--ink-secondary)]">
                          Actor: <strong>{log.actor_role}</strong>
                          {log.actor_id ? ` (${log.actor_id.slice(0, 8)})` : " (System / Resident)"}
                        </span>
                      </div>

                      <div className="rounded bg-[var(--bg-muted)]/60 border border-[var(--border-grid)] p-2.5 font-mono text-[11px] text-[var(--ink-primary)] overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(log.payload, null, 2)}</pre>
                      </div>

                      <div className="flex items-center gap-4 font-mono text-[10px] text-[var(--ink-secondary)]">
                        <span>Entity ID: {log.entity_id}</span>
                        <span>•</span>
                        <span>Log ID: {log.id}</span>
                      </div>
                    </div>

                    <div className="font-mono text-xs text-[var(--ink-secondary)] shrink-0 text-right">
                      <p className="font-bold text-[var(--ink-primary)]">{new Date(log.created_at).toLocaleTimeString()}</p>
                      <p className="text-[10px] text-[var(--ink-secondary)]">{new Date(log.created_at).toLocaleDateString()}</p>
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
