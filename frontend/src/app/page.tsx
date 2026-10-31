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
  Tag,
  ShieldCheck,
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
    <div className="min-h-screen bg-[#DDE3E8]">
      {/* Imperial Plum Hero Section with Architectural Grid */}
      <section className="relative border-b border-[#C3CDD6] bg-[#3A0F34] bg-grid-plum py-10 px-4 sm:px-6 shadow-sm">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#EAAA00] font-semibold">
                Hyperlocal Discovery Hub
              </span>
              <span className="rounded bg-[#240820] border border-[#EAAA00]/40 px-2 py-0.5 font-mono text-[10px] text-[#F8FAFC] uppercase tracking-wider">
                {town} Region
              </span>
            </div>

            <h1 className="font-mono text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl uppercase">
              OneTownCity — {town}
            </h1>

            <p className="max-w-2xl font-sans text-xs text-[#DDE3E8]/80 leading-relaxed">
              Verified higher education institutes, structured course admissions, town updates,
              civic development tracker, verified student hostels, and claimable local storefronts.
            </p>
          </div>

          {/* Elevated Search Shell */}
          <div className="mt-6 rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-2 shadow-lg sm:p-2.5">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#5E4B5B] ml-2 shrink-0" strokeWidth={1.75} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search colleges, courses, bookstores, study cafes, or news in ${town}...`}
                className="w-full bg-transparent font-mono text-xs text-[#1E081B] placeholder-[#5E4B5B] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="font-mono text-[10px] text-[#5E4B5B] hover:text-[#1E081B] uppercase px-2 py-1 rounded bg-[#DDE3E8]"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => fetchData()}
                className="hidden sm:inline-flex items-center gap-1.5 rounded bg-[#EAAA00] px-4 py-2 font-mono text-xs font-bold text-[#240820] hover:bg-[#ffc02e] shadow-xs transition-colors shrink-0 uppercase"
              >
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* 5 Vertical Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-[#C3CDD6]">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded px-3.5 py-2 font-mono text-xs font-bold uppercase transition-all shadow-xs ${
              activeTab === "all"
                ? "bg-[#EAAA00] text-[#240820] ring-1 ring-[#240820]"
                : "border border-[#C3CDD6] bg-[#F8FAFC] text-[#5E4B5B] hover:border-[#3A0F34] hover:text-[#1E081B]"
            }`}
          >
            All Verticals
          </button>
          <button
            onClick={() => setActiveTab("education")}
            className={`flex items-center gap-1.5 rounded px-3.5 py-2 font-mono text-xs font-bold uppercase transition-all shadow-xs ${
              activeTab === "education"
                ? "bg-[#EAAA00] text-[#240820] ring-1 ring-[#240820]"
                : "border border-[#C3CDD6] bg-[#F8FAFC] text-[#5E4B5B] hover:border-[#3A0F34] hover:text-[#1E081B]"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Education Hub</span>
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-1.5 rounded px-3.5 py-2 font-mono text-xs font-bold uppercase transition-all shadow-xs ${
              activeTab === "students"
                ? "bg-[#EAAA00] text-[#240820] ring-1 ring-[#240820]"
                : "border border-[#C3CDD6] bg-[#F8FAFC] text-[#5E4B5B] hover:border-[#3A0F34] hover:text-[#1E081B]"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Student Corner</span>
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`flex items-center gap-1.5 rounded px-3.5 py-2 font-mono text-xs font-bold uppercase transition-all shadow-xs ${
              activeTab === "news"
                ? "bg-[#EAAA00] text-[#240820] ring-1 ring-[#240820]"
                : "border border-[#C3CDD6] bg-[#F8FAFC] text-[#5E4B5B] hover:border-[#3A0F34] hover:text-[#1E081B]"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>News & Town Pulse</span>
          </button>
          <button
            onClick={() => setActiveTab("business")}
            className={`flex items-center gap-1.5 rounded px-3.5 py-2 font-mono text-xs font-bold uppercase transition-all shadow-xs ${
              activeTab === "business"
                ? "bg-[#EAAA00] text-[#240820] ring-1 ring-[#240820]"
                : "border border-[#C3CDD6] bg-[#F8FAFC] text-[#5E4B5B] hover:border-[#3A0F34] hover:text-[#1E081B]"
            }`}
          >
            <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>Local Businesses</span>
          </button>
        </div>

        {/* Mandatory Anti-Scam Consumer Protection Notice */}
        {(activeTab === "all" || activeTab === "students") && (
          <div className="my-6 flex items-start gap-3 rounded-r-md border-l-4 border-[#EAAA00] bg-[#3A0F34] p-4 text-[#F8FAFC] shadow-sm">
            <AlertTriangle className="h-4 w-4 text-[#EAAA00] mt-0.5 shrink-0" strokeWidth={1.75} />
            <div className="font-mono text-xs leading-relaxed">
              <span className="font-bold text-[#EAAA00] uppercase tracking-wide">
                Anti-Scam Consumer Protection Notice:
              </span>{" "}
              <span className="text-[#F8FAFC]/90">
                Never pay money to apply for any student internship, scholarship, or recruitment drive.
                Legitimate institutions and employers never demand processing fees.
              </span>
            </div>
          </div>
        )}

        {/* Vertical Content Sections */}
        <div className="mt-8 space-y-12">
          {/* Listings Section (Education & Business) */}
          {(activeTab === "all" || activeTab === "education" || activeTab === "business") && (
            <div>
              <div className="flex items-center justify-between border-b border-[#C3CDD6] pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 bg-[#3A0F34] rounded-xs" />
                  <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#3A0F34]">
                    Directory Listings ({listings.length})
                  </h2>
                </div>
                <span className="font-mono text-xs text-[#5E4B5B] uppercase font-semibold">
                  Sorted by Verified Freshness
                </span>
              </div>

              {isLoading ? (
                <div className="py-12 text-center font-mono text-xs text-[#5E4B5B] uppercase">
                  Loading verified directory records...
                </div>
              ) : listings.length === 0 ? (
                <div className="rounded border border-[#C3CDD6] bg-[#F8FAFC] py-12 text-center font-mono text-xs text-[#5E4B5B] uppercase shadow-xs">
                  No matching listings found for this town query.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {listings.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm hover:border-[#3A0F34] transition-all hover:shadow-md"
                    >
                      <div>
                        {/* Top Badge Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-[#DDE3E8] border border-[#C3CDD6] px-2 py-0.5 font-mono text-[10px] font-bold text-[#1E081B] uppercase">
                              {item.category_name}
                            </span>
                            {item.is_sponsored && (
                              <span className="rounded bg-[#EAAA00] px-2 py-0.5 font-mono text-[9px] font-extrabold text-[#240820] uppercase tracking-wider shadow-xs">
                                Sponsored
                              </span>
                            )}
                          </div>

                          {/* Semantic Verification Badges */}
                          <div>
                            {item.verification_status === "details_reviewed" && (
                              <span className="inline-flex items-center gap-1 rounded bg-[#0D6E52] px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase shadow-xs">
                                <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={2} />
                                Details Reviewed
                              </span>
                            )}
                            {item.verification_status === "owner_claimed" && (
                              <span className="inline-flex items-center gap-1 rounded bg-[#3A0F34] px-2 py-0.5 font-mono text-[9px] font-bold text-[#F8FAFC] uppercase">
                                <ShieldCheck className="h-3 w-3 text-[#EAAA00]" strokeWidth={2} />
                                Owner Claimed
                              </span>
                            )}
                            {item.verification_status === "not_verified" && (
                              <span className="rounded bg-[#DDE3E8] border border-[#C3CDD6] px-1.5 py-0.5 font-mono text-[9px] text-[#5E4B5B] uppercase">
                                Not Verified
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Tagline */}
                        <Link
                          href={`/listings/${item.slug}`}
                          className="font-mono text-base font-bold text-[#3A0F34] hover:text-[#240820] hover:underline uppercase tracking-tight block"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 font-sans text-xs text-[#5E4B5B] line-clamp-2">
                          {item.tagline}
                        </p>

                        {/* Student / Local Offer Highlight Bar */}
                        <div className="my-3 flex items-center justify-between rounded-r bg-[#EAAA00]/15 border-l-4 border-[#EAAA00] px-3 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <Tag className="h-3 w-3 text-[#3A0F34]" strokeWidth={1.75} />
                            <span className="font-mono text-[10px] font-bold text-[#1E081B] uppercase tracking-wide">
                              {item.vertical === "education" ? "Student Admission Window Active" : "Local Student Discount Available"}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-[#0D6E52]">
                            Verified Partner
                          </span>
                        </div>

                        {/* Locality & Timestamps in Tabular Monospace */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-[#5E4B5B]">
                          <span>Locality: <strong className="text-[#1E081B] font-semibold">{item.locality}</strong></span>
                          <span>City: <strong className="text-[#1E081B] font-semibold">{item.city}</strong></span>
                          <span className="font-mono-numbers text-[#5E4B5B]">
                            Confirmed: {new Date(item.last_confirmed_at).toISOString().split("T")[0]}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-5 flex items-center justify-between border-t border-[#C3CDD6] pt-3">
                        <div className="flex items-center gap-2">
                          {item.whatsapp && (
                            <a
                              href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => recordClick(item.id, "whatsapp")}
                              className="flex items-center gap-1 rounded border border-[#C3CDD6] bg-[#DDE3E8] px-2.5 py-1.5 font-mono text-[11px] font-medium text-[#1E081B] hover:bg-[#3A0F34] hover:text-[#F8FAFC] transition-colors"
                            >
                              <MessageSquare className="h-3 w-3" strokeWidth={1.75} />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              onClick={() => recordClick(item.id, "call")}
                              className="flex items-center gap-1 rounded border border-[#C3CDD6] bg-[#DDE3E8] px-2.5 py-1.5 font-mono text-[11px] font-medium text-[#1E081B] hover:bg-[#3A0F34] hover:text-[#F8FAFC] transition-colors"
                            >
                              <Phone className="h-3 w-3" strokeWidth={1.75} />
                              <span>Call</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setReportListing(item)}
                            title="Report inaccurate details"
                            className="rounded p-1.5 text-[#5E4B5B] hover:bg-[#DDE3E8] hover:text-[#B93829] transition-colors"
                          >
                            <Flag className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </button>

                          <button
                            onClick={() => setEnquiryListing(item)}
                            className="rounded bg-[#3A0F34] px-3.5 py-1.5 font-mono text-xs font-bold uppercase text-[#F8FAFC] hover:bg-[#240820] shadow-xs transition-colors"
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
              <div className="flex items-center justify-between border-b border-[#C3CDD6] pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 bg-[#3A0F34] rounded-xs" />
                  <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#3A0F34]">
                    Student Corner: Opportunities & Verified Hostels ({studentOpps.length})
                  </h2>
                </div>
                <span className="font-mono text-xs text-[#0D6E52] uppercase font-bold">Anti-Scam Protected</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {studentOpps.map((opp) => (
                  <div
                    key={opp.id}
                    className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-5 flex flex-col justify-between shadow-sm hover:border-[#3A0F34] transition-all hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="rounded bg-[#3A0F34] px-2 py-0.5 font-mono text-[10px] font-bold text-[#F8FAFC] uppercase">
                          {opp.opportunity_type.replace(/_/g, " ")}
                        </span>
                        {opp.deadline && (
                          <span className="font-mono text-[10px] text-[#5E4B5B] font-mono-numbers font-semibold">
                            Deadline: {opp.deadline}
                          </span>
                        )}
                      </div>

                      <h3 className="font-mono text-base font-bold text-[#3A0F34] uppercase">
                        {opp.title}
                      </h3>
                      <div className="font-mono text-xs text-[#5E4B5B] mt-0.5">
                        Provider: <span className="text-[#1E081B] font-semibold">{opp.provider_name}</span>
                      </div>

                      <p className="mt-2 font-sans text-xs text-[#1E081B]/80 leading-relaxed">
                        {opp.description}
                      </p>

                      {opp.eligibility && (
                        <div className="mt-2.5 rounded bg-[#DDE3E8]/60 p-2 font-mono text-[11px] text-[#5E4B5B] border border-[#C3CDD6]/50">
                          <span className="text-[#3A0F34] uppercase font-bold">Eligibility:</span>{" "}
                          {opp.eligibility}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[11px] text-[#1E081B]">
                        {opp.stipend_amount && (
                          <span className="rounded bg-[#0D6E52]/10 border border-[#0D6E52]/30 px-2 py-0.5 text-[#0D6E52] font-mono-numbers">
                            Stipend: <strong>{opp.stipend_amount}</strong>
                          </span>
                        )}
                        {opp.discount_percent && (
                          <span className="rounded bg-[#EAAA00]/20 border border-[#EAAA00] px-2 py-0.5 text-[#240820] font-bold font-mono-numbers">
                            Discount: {opp.discount_percent}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[#C3CDD6] pt-3">
                      <span className="font-mono text-[10px] text-[#0D6E52] uppercase font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                        Verified Listing
                      </span>
                      {opp.apply_url ? (
                        <a
                          href={opp.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded bg-[#EAAA00] px-3.5 py-1.5 font-mono text-xs font-bold uppercase text-[#240820] hover:bg-[#ffc02e] shadow-xs transition-colors"
                        >
                          <span>Apply / Details</span>
                          <ExternalLink className="h-3 w-3" strokeWidth={2} />
                        </a>
                      ) : opp.contact_phone ? (
                        <a
                          href={`tel:${opp.contact_phone}`}
                          className="rounded border border-[#C3CDD6] bg-[#DDE3E8] px-3 py-1.5 font-mono text-xs font-semibold text-[#1E081B] hover:bg-[#3A0F34] hover:text-[#F8FAFC] transition-colors"
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
              <div className="flex items-center justify-between border-b border-[#C3CDD6] pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 bg-[#3A0F34] rounded-xs" />
                  <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#3A0F34]">
                    News & Civic Development Tracker ({newsItems.length})
                  </h2>
                </div>
                <span className="font-mono text-xs text-[#5E4B5B] uppercase font-semibold">Verified Sources</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {newsItems.map((news) => (
                  <div
                    key={news.id}
                    className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-5 flex flex-col justify-between shadow-sm hover:border-[#3A0F34] transition-all hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="rounded bg-[#DDE3E8] border border-[#C3CDD6] px-2 py-0.5 font-mono text-[10px] font-bold text-[#1E081B] uppercase">
                          {news.item_type.replace(/_/g, " ")}
                        </span>

                        {/* Semantic Fact vs Proposal Indicator */}
                        {news.is_confirmed_fact ? (
                          <span className="inline-flex items-center gap-1 rounded bg-[#0D6E52] px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase shadow-xs">
                            <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={2} />
                            Confirmed Fact
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-[#EAAA00] px-2 py-0.5 font-mono text-[9px] font-bold text-[#240820] uppercase shadow-xs">
                            <AlertCircle className="h-3 w-3 text-[#240820]" strokeWidth={2} />
                            Proposal / In Review
                          </span>
                        )}
                      </div>

                      <h3 className="font-mono text-base font-bold text-[#3A0F34] uppercase">
                        {news.title}
                      </h3>

                      {news.event_date && (
                        <div className="my-2.5 rounded bg-[#DDE3E8]/70 border border-[#C3CDD6] p-2 font-mono text-xs text-[#1E081B] font-mono-numbers">
                          Date: {news.event_date} {news.event_time && `at ${news.event_time}`} | Venue: {news.event_venue}
                        </div>
                      )}

                      <p className="mt-2 font-sans text-xs text-[#1E081B]/80 leading-relaxed">
                        {news.content}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-[#C3CDD6] pt-3 font-mono text-[11px] text-[#5E4B5B]">
                      <span>Source: <strong className="text-[#1E081B]">{news.source_name}</strong></span>
                      {news.source_url && (
                        <a
                          href={news.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#3A0F34] hover:text-[#EAAA00] underline"
                        >
                          <span>View Source</span>
                          <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
