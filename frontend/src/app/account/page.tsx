"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Shield,
  KeyRound,
  Building2,
  Trash2,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  LogOut,
  PlusCircle,
} from "lucide-react";

interface SessionInfo {
  id: string;
  user_agent: string | null;
  ip_address: string | null;
  expires_at: string;
  created_at: string;
  is_current: boolean;
}

interface ClaimInfo {
  id: string;
  listing_id: string;
  listing_name: string;
  organization_name: string;
  official_email: string;
  official_phone: string;
  status: "pending_review" | "approved" | "rejected";
  review_notes?: string | null;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, tenant, allMemberships, isLoading, logout, refreshUser } = useAuth();

  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [claims, setClaims] = useState<ClaimInfo[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Claim submission form state
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimListingId, setClaimListingId] = useState("");
  const [claimOrgName, setClaimOrgName] = useState("");
  const [claimEmail, setClaimEmail] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [claimEvidence, setClaimEvidence] = useState("");
  const [submittingClaim, setSubmittingClaim] = useState(false);

  const fetchProfileAndSessions = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/auth/me", {
        credentials: "include",
        signal,
      });

      if (res.ok) {
        const data = await res.json();
        if (!signal?.aborted) {
          setSessions(data.sessions || []);
          setPermissions(data.permissions || []);
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
    }
  }, []);

  const fetchMyClaims = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/v1/claims", {
        credentials: "include",
        signal,
      });
      if (res.ok) {
        const data = await res.json();
        if (!signal?.aborted) {
          setClaims(data || []);
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
    } finally {
      if (!signal?.aborted) {
        setLoadingData(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (!isLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchProfileAndSessions(controller.signal);
      fetchMyClaims(controller.signal);
    }
    return () => controller.abort();
  }, [user, isLoading, router, fetchProfileAndSessions, fetchMyClaims]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/v1/auth/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Session Revoked", {
          description: "The targeted session token has been securely invalidated.",
        });
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        // If current session was revoked, logout
        const wasCurrent = sessions.find((s) => s.id === sessionId)?.is_current;
        if (wasCurrent) {
          await logout();
          router.push("/login");
        }
      } else {
        toast.error("Failed to revoke session.");
      }
    } catch {
      toast.error("Network error while revoking session.");
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimListingId.trim() || !claimOrgName.trim() || !claimEvidence.trim()) {
      toast.error("Please fill in all required claim fields.");
      return;
    }

    setSubmittingClaim(true);
    try {
      const res = await fetch("/api/v1/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          listing_id: claimListingId.trim(),
          organization_name: claimOrgName.trim(),
          official_email: claimEmail.trim() || user?.email,
          official_phone: claimPhone.trim(),
          verification_evidence: claimEvidence.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Ownership Claim Submitted", {
          description: "Our city governance team will review your verification evidence.",
        });
        setShowClaimForm(false);
        setClaimListingId("");
        setClaimOrgName("");
        setClaimEvidence("");
        fetchMyClaims();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Failed to submit claim", {
          description: err.error || "Could not submit claim.",
        });
      }
    } catch {
      toast.error("Network error submitting claim.");
    } finally {
      setSubmittingClaim(false);
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="min-h-[calc(100vh-88px)] flex items-center justify-center p-8">
        <div className="font-mono text-xs flex items-center gap-2 text-neutral-500">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span>Synchronizing Security Ledger...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-88px)] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: "var(--border-grid)" }}>
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-1">
              <span>Security Console</span>
              <span>/</span>
              <span className="text-orange-600">{user.role.replace("_", " ")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--ink-primary)" }}>
              Account &amp; Access Controls
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {["super_admin", "city_admin", "sub_admin"].includes(user.role) && (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded font-mono text-xs font-semibold uppercase tracking-wider text-white inline-flex items-center gap-1.5 pressable"
                style={{ backgroundColor: "var(--status-verified)" }}
              >
                <Shield className="w-3.5 h-3.5" />
                Governance Queue
              </Link>
            )}

            {["tenant_owner", "tenant_staff"].includes(user.role) && (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded font-mono text-xs font-semibold uppercase tracking-wider text-white inline-flex items-center gap-1.5 pressable"
                style={{ backgroundColor: "var(--accent-signal)" }}
              >
                <Building2 className="w-3.5 h-3.5" />
                SaaS Studio
              </Link>
            )}

            <button
              onClick={logout}
              className="px-3 py-1.5 rounded font-mono text-xs font-semibold uppercase tracking-wider border hover:bg-red-50 text-red-600 hover:border-red-300 inline-flex items-center gap-1.5 pressable transition-colors"
              style={{ borderColor: "var(--border-grid)" }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Identity & Tenancy Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Ledger Card */}
          <div
            className="md:col-span-2 p-6 rounded border bg-white space-y-4"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-grid)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border-grid)" }}>
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-orange-600" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: "var(--ink-primary)" }}>
                  Verified Identity Profile
                </span>
              </div>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-bold">
                Active Account
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block font-mono text-[10px] uppercase text-neutral-400">Full Legal / Display Name</span>
                <span className="font-semibold text-sm" style={{ color: "var(--ink-primary)" }}>
                  {user.name}
                </span>
              </div>

              <div>
                <span className="block font-mono text-[10px] uppercase text-neutral-400">Official Email</span>
                <span className="font-mono font-medium" style={{ color: "var(--ink-primary)" }}>
                  {user.email}
                </span>
              </div>

              <div>
                <span className="block font-mono text-[10px] uppercase text-neutral-400">Assigned RBAC Role</span>
                <span className="inline-block mt-1 font-mono text-[10px] px-2 py-0.5 rounded border border-neutral-300 bg-neutral-100 font-bold uppercase" style={{ color: "var(--ink-primary)" }}>
                  {user.role}
                </span>
              </div>

              <div>
                <span className="block font-mono text-[10px] uppercase text-neutral-400">Account ID (UUID)</span>
                <span className="font-mono text-[11px] text-neutral-500 truncate block">
                  {user.id}
                </span>
              </div>
            </div>

            {/* Permissions */}
            <div className="pt-3 border-t" style={{ borderColor: "var(--border-grid)" }}>
              <span className="block font-mono text-[10px] uppercase text-neutral-400 mb-2">
                Active Entitlements &amp; Permissions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {permissions.map((perm) => (
                  <span
                    key={perm}
                    className="font-mono text-[10px] px-2 py-0.5 rounded border bg-neutral-50 text-neutral-700"
                    style={{ borderColor: "var(--border-grid)" }}
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tenancy Context Card */}
          <div
            className="p-6 rounded border bg-white flex flex-col justify-between"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-grid)",
            }}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: "var(--border-grid)" }}>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-600" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: "var(--ink-primary)" }}>
                    Tenant Scope
                  </span>
                </div>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200 uppercase">
                  Server Derived
                </span>
              </div>

              {tenant ? (
                <div className="space-y-3">
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-neutral-400">Organization</span>
                    <span className="font-bold text-sm" style={{ color: "var(--ink-primary)" }}>
                      {tenant.organization_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block font-mono text-[10px] uppercase text-neutral-400">Vertical</span>
                      <span className="font-mono text-xs font-medium uppercase">{tenant.vertical}</span>
                    </div>
                    <div>
                      <span className="block font-mono text-[10px] uppercase text-neutral-400">Town</span>
                      <span className="font-mono text-xs font-medium">{tenant.city}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="block font-mono text-[10px] uppercase text-neutral-400 mb-1">Active Plan Tier</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200 font-bold uppercase">
                      {tenant.plan_tier.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500 text-xs py-4">
                  <p>No tenant organization attached to this persona.</p>
                  <p className="mt-2 text-[11px] text-neutral-400">
                    If you represent an existing college or business in Nellore or Kuppam, submit an ownership claim below.
                  </p>
                </div>
              )}
            </div>

            {tenant && (
              <div className="mt-4 pt-3 border-t" style={{ borderColor: "var(--border-grid)" }}>
                <Link
                  href="/dashboard"
                  className="w-full py-2 rounded font-mono text-xs font-bold uppercase tracking-wider border hover:bg-neutral-50 text-center block pressable"
                  style={{ borderColor: "var(--border-grid)", color: "var(--ink-primary)" }}
                >
                  Manage Organization Dashboard &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Directory Ownership Claims Section */}
        <div
          className="p-6 rounded border bg-white space-y-6"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-grid)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: "var(--border-grid)" }}>
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: "var(--ink-primary)" }}>
                  Directory Ownership Claims
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Claim existing unverified directory listings by providing official registration proof or institutional domain evidence.
              </p>
            </div>

            <button
              onClick={() => setShowClaimForm(!showClaimForm)}
              className="px-3 py-1.5 rounded font-mono text-xs font-semibold uppercase tracking-wider border hover:bg-neutral-50 inline-flex items-center gap-1.5 pressable self-start sm:self-auto"
              style={{ borderColor: "var(--border-grid)", color: "var(--ink-primary)" }}
            >
              <PlusCircle className="w-3.5 h-3.5 text-orange-600" />
              {showClaimForm ? "Close Form" : "Claim a Listing"}
            </button>
          </div>

          {/* Claim Submission Form */}
          {showClaimForm && (
            <form onSubmit={handleSubmitClaim} className="p-4 rounded border bg-neutral-50/50 space-y-4 animate-in fade-in duration-150" style={{ borderColor: "var(--border-grid)" }}>
              <div className="font-mono text-xs font-bold uppercase tracking-wide text-neutral-700">
                New Ownership Claim Submission
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Listing ID (UUID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={claimListingId}
                    onChange={(e) => setClaimListingId(e.target.value)}
                    placeholder="e.g. 11111111-1111-1111-1111-111111111101"
                    className="w-full px-3 py-1.5 rounded border font-mono text-xs outline-none bg-white"
                    style={{ borderColor: "var(--border-grid)" }}
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Official Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={claimOrgName}
                    onChange={(e) => setClaimOrgName(e.target.value)}
                    placeholder="e.g. Kaveri Technical Bookstore"
                    className="w-full px-3 py-1.5 rounded border font-mono text-xs outline-none bg-white"
                    style={{ borderColor: "var(--border-grid)" }}
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Official Contact Email
                  </label>
                  <input
                    type="email"
                    value={claimEmail}
                    onChange={(e) => setClaimEmail(e.target.value)}
                    placeholder={user.email}
                    className="w-full px-3 py-1.5 rounded border font-mono text-xs outline-none bg-white"
                    style={{ borderColor: "var(--border-grid)" }}
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Official Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={claimPhone}
                    onChange={(e) => setClaimPhone(e.target.value)}
                    placeholder="+91 94400 12345"
                    className="w-full px-3 py-1.5 rounded border font-mono text-xs outline-none bg-white"
                    style={{ borderColor: "var(--border-grid)" }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Verification Evidence &amp; Domain / Registration Proof *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={claimEvidence}
                    onChange={(e) => setClaimEvidence(e.target.value)}
                    placeholder="Provide GSTIN number, AICTE approval code, registered business lease reference, or institutional email proof."
                    className="w-full px-3 py-2 rounded border font-mono text-xs outline-none bg-white"
                    style={{ borderColor: "var(--border-grid)" }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClaimForm(false)}
                  className="px-3 py-1.5 rounded font-mono text-xs font-semibold uppercase tracking-wider border hover:bg-neutral-100"
                  style={{ borderColor: "var(--border-grid)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim}
                  className="px-4 py-1.5 rounded font-mono text-xs font-bold uppercase tracking-wider text-white pressable disabled:opacity-50"
                  style={{ backgroundColor: "var(--accent-signal)" }}
                >
                  {submittingClaim ? "Submitting..." : "Submit Claim for Review"}
                </button>
              </div>
            </form>
          )}

          {/* Claims List Table */}
          {claims.length === 0 ? (
            <div className="text-center py-6 text-xs text-neutral-400 font-mono">
              No ownership claims currently submitted under this account.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b text-[10px] uppercase text-neutral-400" style={{ borderColor: "var(--border-grid)" }}>
                    <th className="pb-2">Listing</th>
                    <th className="pb-2">Organization</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Submitted</th>
                    <th className="pb-2">Review Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border-grid)" }}>
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 font-semibold" style={{ color: "var(--ink-primary)" }}>
                        {claim.listing_name}
                      </td>
                      <td className="py-2.5 text-neutral-600">{claim.organization_name}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${
                            claim.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : claim.status === "rejected"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {claim.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-2.5 text-neutral-400 text-[10px]">
                        {new Date(claim.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 text-neutral-500 text-[11px]">
                        {claim.review_notes || "Awaiting administrator review"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cryptographic Session Ledger */}
        <div
          className="p-6 rounded border bg-white space-y-4"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-grid)",
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border-grid)" }}>
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-orange-600" />
              <div>
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: "var(--ink-primary)" }}>
                  Active Security Sessions
                </h2>
                <p className="text-[11px] text-neutral-500">
                  SHA-256 token hashes stored on server. Revoking a session immediately terminates client authentication.
                </p>
              </div>
            </div>
            <span className="font-mono text-[10px] text-neutral-400">
              {sessions.length} Active Session{sessions.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b text-[10px] uppercase text-neutral-400" style={{ borderColor: "var(--border-grid)" }}>
                  <th className="pb-2">Client / User Agent</th>
                  <th className="pb-2">IP Address</th>
                  <th className="pb-2">Created</th>
                  <th className="pb-2">Expires</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-grid)" }}>
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-neutral-50/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate max-w-xs" style={{ color: "var(--ink-primary)" }}>
                          {sess.user_agent || "Web Browser Session"}
                        </span>
                        {sess.is_current && (
                          <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold uppercase">
                            This Device
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 block truncate max-w-xs">
                        Session: {sess.id}
                      </span>
                    </td>
                    <td className="py-3 text-neutral-600">
                      {sess.ip_address || "127.0.0.1 (Localhost)"}
                    </td>
                    <td className="py-3 text-neutral-500 text-[10px]">
                      {new Date(sess.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 text-neutral-500 text-[10px]">
                      {new Date(sess.expires_at).toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        className="px-2 py-1 rounded font-mono text-[10px] uppercase font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors inline-flex items-center gap-1"
                        title="Revoke session token"
                      >
                        <Trash2 className="w-3 h-3" />
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
