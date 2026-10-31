"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTown } from "@/components/TownContext";
import { EnquiryModal } from "@/components/EnquiryModal";
import { ReportModal } from "@/components/ReportModal";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  GraduationCap,
  Calendar,
  ExternalLink,
  MessageSquare,
  Phone,
  FileText,
  AlertCircle,
  Flag,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

type ListingItem = {
  id: string;
  tenant_id: string;
  vertical: "news" | "education" | "students" | "business";
  category_name: string;
  slug: string;
  name: string;
  tagline: string;
  address: string;
  locality: string;
  city: string;
  phone: string;
  whatsapp: string;
  is_sponsored: boolean;
  verification_status: "not_verified" | "owner_claimed" | "details_reviewed";
  view_count: number;
  whatsapp_clicks: number;
  last_confirmed_at: string;
};

type NewsItem = {
  id: string;
  city: string;
  locality: string;
  item_type: "news" | "event" | "civic_project";
  title: string;
  slug: string;
  content: string;
  source_name: string;
  source_url: string;
  is_confirmed_fact: boolean;
  event_date: string | null;
  event_time: string | null;
  event_venue: string | null;
  created_at: string;
};

type StudentOpportunity = {
  id: string;
  city: string;
  opportunity_type: "internship" | "scholarship" | "hackathon" | "admission_drive" | "student_hostel" | "student_discount";
  title: string;
  slug: string;
  provider_name: string;
  description: string;
  eligibility: string;
  deadline: string | null;
  apply_url: string;
  contact_phone: string;
  discount_percent: number | null;
  stipend_amount: string | null;
  created_at: string;
};

export default function DiscoveryHub() {
  const { town } = useTown();
  const [activeTab, setActiveTab] = useState<"all" | "news" | "education" | "students" | "business">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [studentOpps, setStudentOpps] = useState<StudentOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [enquiryListing, setEnquiryListing] = useState<ListingItem | null>(null);
  const [reportListing, setReportListing] = useState<ListingItem | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Listings
      let listingsUrl = `${API_BASE}/listings?city=${encodeURIComponent(town)}`;
      if (activeTab === "education" || activeTab === "business") {
        listingsUrl += `&vertical=${activeTab}`;
      }
      if (searchQuery.trim()) {
        listingsUrl += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }

      const [resListings, resNews, resOpps] = await Promise.all([
        fetch(listingsUrl).then((r) => (r.ok ? r.json() : [])),
        activeTab === "all" || activeTab === "news"
          ? fetch(`${API_BASE}/news?city=${encodeURIComponent(town)}`).then((r) => (r.ok ? r.json() : []))
          : Promise.resolve([]),
        activeTab === "all" || activeTab === "students"
          ? fetch(`${API_BASE}/students/opportunities?city=${encodeURIComponent(town)}`).then((r) =>
              r.ok ? r.json() : []
            )
          : Promise.resolve([]),
      ]);

      setListings(resListings);
      setNewsItems(resNews);
      setStudentOpps(resOpps);
    } catch (err) {
      console.error("Failed to load discovery data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [town, activeTab, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const recordClick = async (listingId: string, clickType: "whatsapp" | "call") => {
    try {
      await fetch(`${API_BASE}/telemetry/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, click_type: clickType }),
      });
    } catch (e) {
      console.error("Telemetry error:", e);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero / Header Section */}
      <div className="border-b border-neutral-800 pb-8">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              Hyperlocal Discovery Hub
            </span>
            <span className="rounded border border-neutral-800 bg-neutral-900 px-2 py-0.5 font-mono text-[10px] text-neutral-300 uppercase">
              {town} Region
            </span>
          </div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl uppercase">
            OneTownCity — {town}
          </h1>
          <p className="max-w-2xl font-sans text-xs text-neutral-400 leading-relaxed">
            Verified higher education institutes, structured course admissions, town updates,
            civic development tracker, verified student hostels, and claimable local storefronts.
          </p>
        </div>

        {/* Search Input */}
        <div className="mt-6 flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900/80 px-3 py-2.5 shadow-inner">
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search colleges, courses, bookstores, study cafes, or news in ${town}...`}
            className="w-full bg-transparent font-mono text-xs text-neutral-100 placeholder-neutral-500 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="font-mono text-[10px] text-neutral-400 hover:text-white uppercase px-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* 5 Vertical Filter Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-neutral-800/80 pt-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded px-3 py-1.5 font-mono text-xs font-medium uppercase transition-colors ${
              activeTab === "all"
                ? "bg-neutral-100 text-neutral-950 font-bold"
                : "border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
            }`}
          >
            All Verticals
          </button>
          <button
            onClick={() => setActiveTab("education")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-mono text-xs font-medium uppercase transition-colors ${
              activeTab === "education"
                ? "bg-neutral-100 text-neutral-950 font-bold"
                : "border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Education Hub</span>
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-mono text-xs font-medium uppercase transition-colors ${
              activeTab === "students"
                ? "bg-neutral-100 text-neutral-950 font-bold"
                : "border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Student Corner</span>
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-mono text-xs font-medium uppercase transition-colors ${
              activeTab === "news"
                ? "bg-neutral-100 text-neutral-950 font-bold"
                : "border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>News & Town Pulse</span>
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-mono text-xs font-medium uppercase transition-colors ${
              activeTab === "business"
                ? "bg-neutral-100 text-neutral-950 font-bold"
                : "border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Local Businesses</span>
          </button>
        </div>
      </div>

      {/* Mandatory Anti-Scam Advisory Notice for Student Vertical */}
      {(activeTab === "all" || activeTab === "students") && (
        <div className="my-6 flex items-start gap-3 rounded border border-neutral-800 bg-neutral-900/40 p-4">
          <AlertTriangle className="h-4 w-4 text-neutral-300 mt-0.5 shrink-0" />
          <div className="font-mono text-xs">
            <span className="font-bold text-neutral-100 uppercase tracking-wide">
              Anti-Scam Consumer Protection Notice:
            </span>{" "}
            <span className="text-neutral-300">
              Never pay money to apply for any student internship, scholarship, or recruitment drive.
              Legitimate institutions and employers never demand processing fees.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="mt-8 space-y-12">
        {/* Listings Section (Education & Business) */}
        {(activeTab === "all" || activeTab === "education" || activeTab === "business") && (
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-6">
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-200">
                Directory Listings ({listings.length})
              </h2>
              <span className="font-mono text-xs text-neutral-500 uppercase">
                Sorted by Verified Freshness
              </span>
            </div>

            {isLoading ? (
              <div className="py-12 text-center font-mono text-xs text-neutral-500 uppercase">
                Loading verified directory records...
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded border border-neutral-800 bg-neutral-900/20 py-12 text-center font-mono text-xs text-neutral-400 uppercase">
                No matching listings found for this town query.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded border border-neutral-800 bg-neutral-900/30 p-5 hover:border-neutral-700 transition-colors"
                  >
                    <div>
                      {/* Badge row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-[10px] text-neutral-300 uppercase">
                            {item.category_name}
                          </span>
                          {item.is_sponsored && (
                            <span className="rounded border border-amber-600/40 bg-amber-950/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-200 uppercase">
                              Sponsored
                            </span>
                          )}
                        </div>

                        {/* Verification badge */}
                        <div>
                          {item.verification_status === "details_reviewed" && (
                            <span className="inline-flex items-center gap-1 rounded border border-neutral-600 bg-neutral-800 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white uppercase">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                              Details Reviewed
                            </span>
                          )}
                          {item.verification_status === "owner_claimed" && (
                            <span className="inline-flex items-center gap-1 rounded border border-neutral-700 bg-neutral-900 px-1.5 py-0.5 font-mono text-[9px] text-neutral-300 uppercase">
                              Owner Claimed
                            </span>
                          )}
                          {item.verification_status === "not_verified" && (
                            <span className="rounded bg-neutral-950 border border-neutral-800 px-1.5 py-0.5 font-mono text-[9px] text-neutral-500 uppercase">
                              Not Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <Link
                        href={`/listings/${item.slug}`}
                        className="font-mono text-base font-bold text-neutral-100 hover:underline uppercase tracking-tight block"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 font-sans text-xs text-neutral-400 line-clamp-2">
                        {item.tagline}
                      </p>

                      {/* Locality & Timestamps */}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-neutral-400">
                        <span>Locality: {item.locality}</span>
                        <span>City: {item.city}</span>
                        <span className="text-neutral-500 font-mono-numbers">
                          Confirmed: {new Date(item.last_confirmed_at).toISOString().split("T")[0]}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-5 flex items-center justify-between border-t border-neutral-800/80 pt-3">
                      <div className="flex items-center gap-2">
                        {item.whatsapp && (
                          <a
                            href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => recordClick(item.id, "whatsapp")}
                            className="flex items-center gap-1 rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 font-mono text-[11px] text-neutral-200 hover:bg-neutral-800 hover:text-white"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {item.phone && (
                          <a
                            href={`tel:${item.phone}`}
                            onClick={() => recordClick(item.id, "call")}
                            className="flex items-center gap-1 rounded border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 font-mono text-[11px] text-neutral-200 hover:bg-neutral-800 hover:text-white"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Call</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReportListing(item)}
                          title="Report inaccurate details"
                          className="rounded p-1.5 text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300"
                        >
                          <Flag className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setEnquiryListing(item)}
                          className="rounded bg-neutral-100 px-3 py-1.5 font-mono text-xs font-bold uppercase text-neutral-950 hover:bg-white transition-colors"
                        >
                          {item.vertical === "education" ? "Enquire / Apply" : "Enquire"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student Opportunities Section */}
        {(activeTab === "all" || activeTab === "students") && studentOpps.length > 0 && (
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-6">
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-200">
                Student Corner: Opportunities & Verified Hostels ({studentOpps.length})
              </h2>
              <span className="font-mono text-xs text-neutral-500 uppercase">Anti-Scam Protected</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentOpps.map((opp) => (
                <div
                  key={opp.id}
                  className="rounded border border-neutral-800 bg-neutral-900/30 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-[10px] text-neutral-300 uppercase">
                        {opp.opportunity_type.replace(/_/g, " ")}
                      </span>
                      {opp.deadline && (
                        <span className="font-mono text-[10px] text-neutral-400 font-mono-numbers">
                          Deadline: {opp.deadline}
                        </span>
                      )}
                    </div>

                    <h3 className="font-mono text-base font-bold text-neutral-100 uppercase">
                      {opp.title}
                    </h3>
                    <div className="font-mono text-xs text-neutral-400 mt-0.5">
                      Provider: <span className="text-neutral-200">{opp.provider_name}</span>
                    </div>

                    <p className="mt-2 font-sans text-xs text-neutral-300 leading-relaxed">
                      {opp.description}
                    </p>

                    {opp.eligibility && (
                      <div className="mt-2 rounded bg-neutral-900/60 p-2 font-mono text-[11px] text-neutral-400">
                        <span className="text-neutral-200 uppercase font-semibold">Eligibility:</span>{" "}
                        {opp.eligibility}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[11px] text-neutral-300">
                      {opp.stipend_amount && (
                        <span>Stipend: <strong className="text-white">{opp.stipend_amount}</strong></span>
                      )}
                      {opp.discount_percent && (
                        <span>Discount: <strong className="text-white">{opp.discount_percent}% OFF</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-neutral-800/80 pt-3">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase">
                      Verified Listing
                    </span>
                    {opp.apply_url ? (
                      <a
                        href={opp.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded bg-neutral-100 px-3 py-1.5 font-mono text-xs font-bold uppercase text-neutral-950 hover:bg-white"
                      >
                        <span>Apply / Details</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : opp.contact_phone ? (
                      <a
                        href={`tel:${opp.contact_phone}`}
                        className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-mono text-xs text-white hover:bg-neutral-800"
                      >
                        Call Provider: {opp.contact_phone}
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* News & Civic Development Tracker Section */}
        {(activeTab === "all" || activeTab === "news") && newsItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-6">
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-neutral-200">
                News & Civic Development Tracker ({newsItems.length})
              </h2>
              <span className="font-mono text-xs text-neutral-500 uppercase">Verified Sources</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newsItems.map((news) => (
                <div
                  key={news.id}
                  className="rounded border border-neutral-800 bg-neutral-900/30 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-[10px] text-neutral-300 uppercase">
                        {news.item_type.replace(/_/g, " ")}
                      </span>

                      {/* Fact vs Proposal Indicator */}
                      {news.is_confirmed_fact ? (
                        <span className="inline-flex items-center gap-1 rounded border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white uppercase">
                          <CheckCircle2 className="h-3 w-3 text-white" />
                          Confirmed Fact
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded border border-amber-900/50 bg-amber-950/20 px-1.5 py-0.5 font-mono text-[9px] text-amber-300 uppercase">
                          <AlertCircle className="h-3 w-3 text-amber-400" />
                          Proposal / In Review
                        </span>
                      )}
                    </div>

                    <h3 className="font-mono text-base font-bold text-neutral-100 uppercase">
                      {news.title}
                    </h3>

                    {news.event_date && (
                      <div className="my-2 rounded bg-neutral-900/70 p-2 font-mono text-xs text-neutral-300">
                        Date: {news.event_date} {news.event_time && `at ${news.event_time}`} | Venue: {news.event_venue}
                      </div>
                    )}

                    <p className="mt-2 font-sans text-xs text-neutral-300 leading-relaxed">
                      {news.content}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-neutral-800/80 pt-3 font-mono text-[11px] text-neutral-400">
                    <span>Source: {news.source_name}</span>
                    {news.source_url && (
                      <a
                        href={news.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-neutral-300 hover:text-white underline"
                      >
                        <span>View Source</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Modals */}
      <EnquiryModal
        isOpen={Boolean(enquiryListing)}
        onClose={() => setEnquiryListing(null)}
        listing={enquiryListing}
        apiUrl={API_BASE}
      />

      <ReportModal
        isOpen={Boolean(reportListing)}
        onClose={() => setReportListing(null)}
        listing={reportListing}
        apiUrl={API_BASE}
      />
    </div>
  );
}
