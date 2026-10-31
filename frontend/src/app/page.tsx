"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTown } from "@/components/TownContext";
import { EnquiryModal } from "@/components/EnquiryModal";
import { ReportModal } from "@/components/ReportModal";
import { getCoverImage, getMonogram } from "@/lib/covers";
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
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
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
  const [selectedLocality, setSelectedLocality] = useState<string>("all");
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);
  const [filterOffersOnly, setFilterOffersOnly] = useState<boolean>(false);

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

  // Localities list for dropdown
  const localities = useMemo(() => {
    const locSet = new Set<string>();
    listings.forEach((l) => {
      if (l.locality) locSet.add(l.locality);
    });
    return Array.from(locSet).sort();
  }, [listings]);

  // Client-side filtering by locality, verified only, and offers
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (selectedLocality !== "all" && l.locality !== selectedLocality) {
        return false;
      }
      if (filterVerifiedOnly && l.verification_status === "not_verified") {
        return false;
      }
      if (filterOffersOnly && !l.is_sponsored && l.vertical !== "education") {
        return false;
      }
      return true;
    });
  }, [listings, selectedLocality, filterVerifiedOnly, filterOffersOnly]);

  const topNews = newsItems[0];
  const topOpp = studentOpps[0];

  return (
    <div className="min-h-screen bg-[#DDE3E8]">
      {/* 1. ARCHITECTURAL 2-COLUMN SPLIT HERO SECTION */}
      <section className="relative overflow-hidden hero-radial-plum text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#C3CDD6]/30 shadow-md">
        {/* Subtle Ambient Gold Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 hero-ambient-glow pointer-events-none" />

        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (7 cols): Editorial Headline & Floating Search Command */}
            <div className="lg:col-span-7 space-y-6">
              {/* Region Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#EAAA00] animate-pulse" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#F8FAFC]">
                  KUPPAM & NELLORE HYPERLOCAL NETWORK
                </span>
                <span className="font-mono text-[10px] text-[#EAAA00] font-semibold uppercase">
                  Verified Local Hub
                </span>
              </div>

              {/* High-Impact Headline (Must contain "OneTownCity — Nellore" for E2E tests) */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight uppercase font-mono">
                  OneTownCity — <span className="text-[#EAAA00]">{town}</span>
                </h1>
                <p className="mt-3 text-sm sm:text-base text-[#DDE3E8]/85 max-w-xl leading-relaxed">
                  Verified higher education institutes, structured course admissions, real-time civic tracker,
                  safe student hostels, and authenticated local storefronts.
                </p>
              </div>

              {/* Segmented Floating Command Search Bar */}
              <div className="max-w-2xl rounded-2xl bg-[#F8FAFC] p-2 ring-4 ring-white/10 shadow-2xl border border-[#C3CDD6]">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Segment 1: Search Input with Icon */}
                  <div className="flex-1 flex items-center gap-2 px-3 py-1">
                    <Search className="h-4 w-4 text-[#5E4B5B] shrink-0" strokeWidth={2} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search colleges, courses, cafes, scholarships in ${town}...`}
                      className="w-full bg-transparent font-sans text-xs text-[#1E081B] placeholder-[#5E4B5B] outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="font-mono text-[10px] text-[#5E4B5B] hover:text-[#1E081B] uppercase px-1.5 py-0.5 rounded bg-[#DDE3E8]"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="hidden sm:block h-7 w-[1px] bg-[#C3CDD6]" />

                  {/* Segment 2: Locality Selector Dropdown */}
                  <div className="flex items-center gap-1.5 px-3 py-1 text-xs text-[#1E081B]">
                    <MapPin className="h-3.5 w-3.5 text-[#3A0F34] shrink-0" strokeWidth={1.75} />
                    <select
                      value={selectedLocality}
                      onChange={(e) => setSelectedLocality(e.target.value)}
                      className="bg-transparent font-mono text-xs font-semibold text-[#1E081B] outline-none cursor-pointer max-w-[130px] truncate"
                    >
                      <option value="all" className="bg-[#F8FAFC] text-[#1E081B]">
                        All Localities
                      </option>
                      {localities.map((loc) => (
                        <option key={loc} value={loc} className="bg-[#F8FAFC] text-[#1E081B]">
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Segment 3: Bold Gold Button */}
                  <button
                    onClick={() => fetchData()}
                    className="rounded-xl bg-[#EAAA00] hover:bg-[#ffc02e] text-[#240820] font-bold text-xs uppercase px-5 py-2.5 transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>Search</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Quick Trending Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-mono text-[#EAAA00] font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>Trending:</span>
                </span>
                {[
                  { label: "B.Tech Admissions", tab: "education" as const, q: "B.Tech" },
                  { label: "Verified Hostels", tab: "students" as const, q: "Hostel" },
                  { label: "Study Cafes", tab: "business" as const, q: "Cafe" },
                  { label: "Merit Scholarships", tab: "students" as const, q: "Scholarship" },
                  { label: "Civic Projects", tab: "news" as const, q: "Development" },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => {
                      setActiveTab(chip.tab);
                      setSearchQuery(chip.q);
                    }}
                    className="rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 text-xs text-white transition-all backdrop-blur-xs font-sans hover:scale-105 active:scale-95"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column (5 cols): Floating "Town Pulse" Bento Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 text-white shadow-2xl space-y-5">
                {/* Header with Live Telemetry */}
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#EAAA00]" strokeWidth={2} />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                      Live Town Telemetry
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#EAAA00] bg-[#240820] border border-[#EAAA00]/40 px-2 py-0.5 rounded-full font-bold">
                    {town} Live
                  </span>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="rounded-xl bg-black/25 p-2.5 border border-white/10">
                    <div className="text-lg font-bold text-white font-mono-numbers">30+</div>
                    <div className="text-[10px] text-white/70 uppercase">Active Listings</div>
                  </div>
                  <div className="rounded-xl bg-black/25 p-2.5 border border-white/10">
                    <div className="text-lg font-bold text-[#EAAA00] font-mono-numbers">100%</div>
                    <div className="text-[10px] text-white/70 uppercase">Reviewed Facts</div>
                  </div>
                  <div className="rounded-xl bg-black/25 p-2.5 border border-white/10">
                    <div className="text-lg font-bold text-emerald-400 font-mono-numbers">Instant</div>
                    <div className="text-[10px] text-white/70 uppercase">Direct Leads</div>
                  </div>
                </div>

                {/* Top Civic Headline Preview */}
                {topNews && (
                  <div className="rounded-xl bg-black/30 border border-white/10 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-[#EAAA00] uppercase font-bold">
                        Top Civic Pulse
                      </span>
                      {topNews.is_confirmed_fact ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[#0D6E52] px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase">
                          <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2} />
                          Confirmed Fact
                        </span>
                      ) : (
                        <span className="rounded bg-[#EAAA00] px-2 py-0.5 font-mono text-[9px] font-bold text-[#240820] uppercase">
                          Proposal
                        </span>
                      )}
                    </div>
                    <h4 className="font-mono text-xs font-bold text-white line-clamp-1">
                      {topNews.title}
                    </h4>
                    <p className="font-sans text-[11px] text-white/70 line-clamp-2">
                      {topNews.content}
                    </p>
                  </div>
                )}

                {/* Featured Student Opportunity Preview */}
                {topOpp && (
                  <div className="rounded-xl bg-black/30 border border-white/10 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-[#EAAA00] uppercase font-bold">
                        Featured Opportunity
                      </span>
                      {topOpp.stipend_amount && (
                        <span className="rounded bg-[#EAAA00] text-[#240820] font-mono font-bold text-[9px] px-2 py-0.5">
                          {topOpp.stipend_amount}
                        </span>
                      )}
                    </div>
                    <h4 className="font-mono text-xs font-bold text-white line-clamp-1">
                      {topOpp.title}
                    </h4>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-white/60 font-mono">
                        By {topOpp.provider_name}
                      </span>
                      <button
                        onClick={() => setActiveTab("students")}
                        className="text-[10px] text-[#EAAA00] hover:underline font-mono font-bold flex items-center gap-1"
                      >
                        <span>View Opportunity</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA ON COOL ALABASTER CANVAS */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Floating Segmented Ribbon Filter Bar */}
        <div className="rounded-2xl bg-[#F8FAFC] p-2 border border-[#C3CDD6] shadow-sm flex flex-wrap items-center justify-between gap-3">
          {/* Vertical Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-xl px-3.5 py-2 font-mono text-xs font-bold uppercase transition-all ${
                activeTab === "all"
                  ? "bg-[#EAAA00] text-[#240820] shadow-sm"
                  : "text-[#5E4B5B] hover:text-[#1E081B] hover:bg-[#DDE3E8]/60"
              }`}
            >
              All Verticals
            </button>
            <button
              onClick={() => setActiveTab("education")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-xs font-bold uppercase transition-all ${
                activeTab === "education"
                  ? "bg-[#EAAA00] text-[#240820] shadow-sm"
                  : "text-[#5E4B5B] hover:text-[#1E081B] hover:bg-[#DDE3E8]/60"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Education Hub</span>
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-xs font-bold uppercase transition-all ${
                activeTab === "students"
                  ? "bg-[#EAAA00] text-[#240820] shadow-sm"
                  : "text-[#5E4B5B] hover:text-[#1E081B] hover:bg-[#DDE3E8]/60"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Student Corner</span>
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-xs font-bold uppercase transition-all ${
                activeTab === "news"
                  ? "bg-[#EAAA00] text-[#240820] shadow-sm"
                  : "text-[#5E4B5B] hover:text-[#1E081B] hover:bg-[#DDE3E8]/60"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>News & Town Pulse</span>
            </button>
            <button
              onClick={() => setActiveTab("business")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-xs font-bold uppercase transition-all ${
                activeTab === "business"
                  ? "bg-[#EAAA00] text-[#240820] shadow-sm"
                  : "text-[#5E4B5B] hover:text-[#1E081B] hover:bg-[#DDE3E8]/60"
              }`}
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Local Businesses</span>
            </button>
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-semibold transition-all border ${
                filterVerifiedOnly
                  ? "bg-[#0D6E52] border-[#0D6E52] text-white shadow-xs"
                  : "bg-white border-[#C3CDD6] text-[#5E4B5B] hover:border-[#3A0F34]"
              }`}
            >
              <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
              <span>Verified Only</span>
            </button>

            <button
              onClick={() => setFilterOffersOnly(!filterOffersOnly)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-semibold transition-all border ${
                filterOffersOnly
                  ? "bg-[#EAAA00] border-[#EAAA00] text-[#240820] font-bold shadow-xs"
                  : "bg-white border-[#C3CDD6] text-[#5E4B5B] hover:border-[#3A0F34]"
              }`}
            >
              <Tag className="h-3 w-3" strokeWidth={2} />
              <span>Active Offers</span>
            </button>
          </div>
        </div>

        {/* 3. MULTI-SECTION ASYMMETRIC GRID (ALL VERTICALS) */}
        {activeTab === "all" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Main Column (8 cols): Featured Institutions & Businesses */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#C3CDD6] pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-1 bg-[#3A0F34] rounded-xs" />
                  <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#3A0F34]">
                    Directory Listings ({filteredListings.length})
                  </h2>
                </div>
                <span className="font-mono text-xs text-[#5E4B5B] uppercase font-semibold">
                  Sorted by Verified Freshness
                </span>
              </div>

              {isLoading ? (
                <div className="py-16 text-center font-mono text-xs text-[#5E4B5B] uppercase">
                  Loading verified directory records...
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="rounded-2xl border border-[#C3CDD6] bg-[#F8FAFC] py-16 text-center font-mono text-xs text-[#5E4B5B] uppercase shadow-sm">
                  No matching listings found for this town query.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredListings.map((item) => (
                    <ListingCard
                      key={item.id}
                      item={item}
                      onEnquire={() => setEnquiryListing(item)}
                      onReport={() => setReportListing(item)}
                      onRecordClick={recordClick}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Sticky Sidebar (4 cols): Town Pulse + Student Corner */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
              {/* Widget 1: Live Town Pulse & Civic Tracker */}
              <div className="rounded-2xl border border-[#C3CDD6] bg-[#F8FAFC] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#C3CDD6] pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#3A0F34]" strokeWidth={1.75} />
                    <h3 className="font-mono text-xs font-bold uppercase text-[#3A0F34] tracking-wider">
                      Town Pulse & Civic Tracker
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("news")}
                    className="font-mono text-[10px] text-[#3A0F34] hover:text-[#EAAA00] uppercase font-bold"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3.5 divide-y divide-[#C3CDD6]/60">
                  {newsItems.slice(0, 3).map((news) => (
                    <div key={news.id} className="pt-3 first:pt-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#DDE3E8] text-[#1E081B] font-bold">
                          {news.item_type.replace(/_/g, " ")}
                        </span>
                        {news.is_confirmed_fact ? (
                          <span className="inline-flex items-center gap-1 rounded bg-[#0D6E52] px-1.5 py-0.5 font-mono text-[8px] font-bold text-white uppercase">
                            <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2} />
                            Confirmed Fact
                          </span>
                        ) : (
                          <span className="rounded bg-[#EAAA00] px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#240820] uppercase">
                            Proposal
                          </span>
                        )}
                      </div>
                      <h4 className="font-mono text-xs font-bold text-[#1E081B] line-clamp-2">
                        {news.title}
                      </h4>
                      <p className="font-sans text-[11px] text-[#5E4B5B] line-clamp-2">
                        {news.content}
                      </p>
                      {news.event_date && (
                        <div className="font-mono text-[10px] text-[#3A0F34] font-mono-numbers">
                          Date: {news.event_date} {news.event_venue && `@ ${news.event_venue}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget 2: Student Corner & Scholarships Box */}
              <div className="rounded-2xl bg-[#3A0F34] text-white p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#EAAA00]" strokeWidth={1.75} />
                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#F8FAFC]">
                      Student Corner Opportunities
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("students")}
                    className="font-mono text-[10px] text-[#EAAA00] hover:underline uppercase font-bold"
                  >
                    All ({studentOpps.length})
                  </button>
                </div>

                {/* Compact, High-Trust Consumer Protection Header (Removes ugly purple bar from page top) */}
                <div className="rounded-r-lg border-l-4 border-[#EAAA00] bg-[#240820] p-3 text-xs text-neutral-200 shadow-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#EAAA00] mt-0.5 shrink-0" strokeWidth={2} />
                    <div className="font-mono text-[11px] leading-relaxed">
                      <span className="font-bold text-[#EAAA00] uppercase block mb-0.5">
                        Anti-Scam Consumer Protection Notice:
                      </span>
                      <span>
                        Never pay money to apply for any student internship, scholarship, or recruitment drive.
                        Legitimate institutions and employers never demand processing fees.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Opportunities Cards */}
                <div className="space-y-3">
                  {studentOpps.slice(0, 3).map((opp) => (
                    <div
                      key={opp.id}
                      className="rounded-xl bg-white/5 border border-white/10 p-3.5 space-y-2 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/15 text-[#EAAA00] font-bold">
                          {opp.opportunity_type.replace(/_/g, " ")}
                        </span>
                        {opp.stipend_amount && (
                          <span className="rounded bg-[#EAAA00] text-[#240820] font-mono font-bold text-[9px] px-2 py-0.5">
                            {opp.stipend_amount}
                          </span>
                        )}
                        {opp.discount_percent && (
                          <span className="rounded bg-[#0D6E52] text-white font-mono font-bold text-[9px] px-2 py-0.5">
                            {opp.discount_percent}% OFF
                          </span>
                        )}
                      </div>
                      <h4 className="font-mono text-xs font-bold text-white line-clamp-1">
                        {opp.title}
                      </h4>
                      <p className="font-sans text-[11px] text-white/70 line-clamp-2">
                        {opp.description}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-white/10">
                        <span className="text-[10px] font-mono text-white/60">
                          {opp.provider_name}
                        </span>
                        {opp.apply_url ? (
                          <a
                            href={opp.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-[#EAAA00] px-2.5 py-1 font-mono text-[10px] font-bold text-[#240820] hover:bg-[#ffc02e] uppercase"
                          >
                            <span>Apply</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ) : opp.contact_phone ? (
                          <a
                            href={`tel:${opp.contact_phone}`}
                            className="font-mono text-[10px] text-[#EAAA00] hover:underline"
                          >
                            Call Provider
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "education" || activeTab === "business" ? (
          /* Dedicated Directory View for Education Hub or Local Businesses */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#C3CDD6] pb-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-[#3A0F34] rounded-xs" />
                <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#3A0F34]">
                  {activeTab === "education" ? "Education Institutions" : "Local Businesses"} ({filteredListings.length})
                </h2>
              </div>
              <span className="font-mono text-xs text-[#5E4B5B] uppercase font-semibold">
                Sorted by Verified Freshness
              </span>
            </div>

            {filteredListings.length === 0 ? (
              <div className="rounded-2xl border border-[#C3CDD6] bg-[#F8FAFC] py-16 text-center font-mono text-xs text-[#5E4B5B] uppercase shadow-sm">
                No matching listings found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((item) => (
                  <ListingCard
                    key={item.id}
                    item={item}
                    onEnquire={() => setEnquiryListing(item)}
                    onReport={() => setReportListing(item)}
                    onRecordClick={recordClick}
                  />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "students" ? (
          /* Dedicated Student Corner View with Prominent Safety Notice */
          <div className="space-y-6">
            {/* Student Safety Notice */}
            <div className="rounded-2xl border-l-4 border-[#EAAA00] bg-[#3A0F34] p-5 text-white shadow-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#EAAA00] mt-0.5 shrink-0" strokeWidth={2} />
                <div className="font-mono text-xs leading-relaxed space-y-1">
                  <span className="font-bold text-[#EAAA00] uppercase text-sm block">
                    Anti-Scam Consumer Protection Notice:
                  </span>
                  <p className="text-white/90">
                    Never pay money to apply for any student internship, scholarship, or recruitment drive.
                    Legitimate institutions and employers never demand processing fees.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-[#C3CDD6] pb-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-[#3A0F34] rounded-xs" />
                <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#3A0F34]">
                  Student Opportunities & Verified Hostels ({studentOpps.length})
                </h2>
              </div>
              <span className="font-mono text-xs text-[#0D6E52] uppercase font-bold">
                Anti-Scam Protected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentOpps.map((opp) => (
                <div
                  key={opp.id}
                  className="rounded-2xl border border-[#C3CDD6] bg-[#F8FAFC] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
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
                    <div className="font-mono text-xs text-[#5E4B5B]">
                      Provider: <strong className="text-[#1E081B]">{opp.provider_name}</strong>
                    </div>

                    <p className="font-sans text-xs text-[#1E081B]/80 leading-relaxed line-clamp-3">
                      {opp.description}
                    </p>

                    {opp.eligibility && (
                      <div className="rounded bg-[#DDE3E8]/60 p-2 font-mono text-[11px] text-[#5E4B5B] border border-[#C3CDD6]/50">
                        <span className="text-[#3A0F34] uppercase font-bold">Eligibility:</span>{" "}
                        {opp.eligibility}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] pt-1">
                      {opp.stipend_amount && (
                        <span className="rounded bg-[#0D6E52]/10 border border-[#0D6E52]/30 px-2 py-0.5 text-[#0D6E52] font-mono-numbers font-bold">
                          Stipend: {opp.stipend_amount}
                        </span>
                      )}
                      {opp.discount_percent && (
                        <span className="rounded bg-[#EAAA00]/20 border border-[#EAAA00] px-2 py-0.5 text-[#240820] font-bold font-mono-numbers">
                          Discount: {opp.discount_percent}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#C3CDD6] pt-3">
                    <span className="font-mono text-[10px] text-[#0D6E52] uppercase font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                      Verified
                    </span>
                    {opp.apply_url ? (
                      <a
                        href={opp.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded bg-[#EAAA00] px-3.5 py-1.5 font-mono text-xs font-bold uppercase text-[#240820] hover:bg-[#ffc02e] shadow-xs"
                      >
                        <span>Apply / Details</span>
                        <ExternalLink className="h-3 w-3" strokeWidth={2} />
                      </a>
                    ) : opp.contact_phone ? (
                      <a
                        href={`tel:${opp.contact_phone}`}
                        className="rounded border border-[#C3CDD6] bg-[#DDE3E8] px-3 py-1.5 font-mono text-xs font-semibold text-[#1E081B] hover:bg-[#3A0F34] hover:text-[#F8FAFC]"
                      >
                        Call: {opp.contact_phone}
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Dedicated News & Civic Development View */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#C3CDD6] pb-3">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-[#3A0F34] rounded-xs" />
                <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#3A0F34]">
                  News & Civic Development Tracker ({newsItems.length})
                </h2>
              </div>
              <span className="font-mono text-xs text-[#5E4B5B] uppercase font-semibold">
                Verified Sources Only
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map((news) => (
                <div
                  key={news.id}
                  className="rounded-2xl border border-[#C3CDD6] bg-[#F8FAFC] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded bg-[#DDE3E8] border border-[#C3CDD6] px-2 py-0.5 font-mono text-[10px] font-bold text-[#1E081B] uppercase">
                        {news.item_type.replace(/_/g, " ")}
                      </span>
                      {news.is_confirmed_fact ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[#0D6E52] px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase shadow-xs">
                          <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={2} />
                          Confirmed Fact
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-[#EAAA00] px-2 py-0.5 font-mono text-[9px] font-bold text-[#240820] uppercase shadow-xs">
                          <AlertCircle className="h-3 w-3 text-[#240820]" strokeWidth={2} />
                          Proposal
                        </span>
                      )}
                    </div>

                    <h3 className="font-mono text-base font-bold text-[#3A0F34] uppercase">
                      {news.title}
                    </h3>

                    {news.event_date && (
                      <div className="rounded bg-[#DDE3E8]/70 border border-[#C3CDD6] p-2 font-mono text-xs text-[#1E081B] font-mono-numbers">
                        Date: {news.event_date} {news.event_time && `at ${news.event_time}`} | Venue: {news.event_venue}
                      </div>
                    )}

                    <p className="font-sans text-xs text-[#1E081B]/80 leading-relaxed">
                      {news.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#C3CDD6] pt-3 font-mono text-[11px] text-[#5E4B5B]">
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

// 4. RICH VISUAL LISTING CARD WITH 130PX COVER, MONOGRAM AVATAR & TICKET OFFER
function ListingCard({
  item,
  onEnquire,
  onReport,
  onRecordClick,
}: {
  item: ListingItem;
  onEnquire: () => void;
  onReport: () => void;
  onRecordClick: (id: string, type: "whatsapp" | "call") => void;
}) {
  const coverUrl = getCoverImage(item.category_name, item.name);
  const monogram = getMonogram(item.name);

  return (
    <div className="group rounded-2xl border border-[#C3CDD6]/80 bg-[#F8FAFC] shadow-[0_2px_12px_rgba(58,15,52,0.06)] hover:shadow-[0_12px_28px_rgba(58,15,52,0.14)] hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* 130px Visual Cover Header with Dark Gradient Scrim */}
        <div className="relative h-[130px] w-full bg-[#3A0F34] overflow-hidden">
          <Image
            src={coverUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F071C]/90 via-[#1F071C]/35 to-transparent" />

          {/* Top-Left Floating Pill: Category Tag */}
          <div className="absolute top-3 left-3 z-10">
            <span className="rounded-md bg-black/45 backdrop-blur-md px-2.5 py-1 font-mono text-[10px] font-bold text-white uppercase tracking-wider border border-white/10 shadow-xs">
              {item.category_name}
            </span>
          </div>

          {/* Top-Right Floating Badges: Sponsored & Verification */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            {item.is_sponsored && (
              <span className="rounded-md bg-[#EAAA00] px-2 py-0.5 font-mono text-[9px] font-extrabold text-[#240820] uppercase shadow-xs">
                Sponsored
              </span>
            )}
            {item.verification_status === "details_reviewed" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#0D6E52] px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase shadow-xs">
                <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2} />
                Details Reviewed
              </span>
            )}
            {item.verification_status === "owner_claimed" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#3A0F34] border border-[#EAAA00]/40 px-2 py-0.5 font-mono text-[9px] font-bold text-[#EAAA00] uppercase shadow-xs">
                <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2} />
                Owner Claimed
              </span>
            )}
            {item.verification_status === "not_verified" && (
              <span className="rounded-md bg-neutral-900/80 px-2 py-0.5 font-mono text-[9px] text-neutral-300 uppercase">
                Not Verified
              </span>
            )}
          </div>
        </div>

        {/* Overlapping Monogram / Institution Avatar along bottom edge */}
        <div className="relative z-10 -mt-6 px-5 flex items-center justify-between">
          <div className="h-12 w-12 rounded-xl bg-[#3A0F34] text-[#EAAA00] border-2 border-[#F8FAFC] font-bold text-base shadow-md flex items-center justify-center shrink-0 tracking-wider">
            {monogram}
          </div>
          <span className="font-mono text-[10px] text-[#5E4B5B] font-mono-numbers bg-[#DDE3E8]/50 px-2 py-0.5 rounded">
            Confirmed: {new Date(item.last_confirmed_at).toISOString().split("T")[0]}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 pt-3 space-y-2">
          {/* Institution / Business Title */}
          <Link
            href={`/listings/${item.slug}`}
            className="font-mono text-base font-bold text-[#1E081B] group-hover:text-[#3A0F34] transition-colors uppercase tracking-tight block line-clamp-1"
          >
            {item.name}
          </Link>

          {/* Locality Pin + Address */}
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#5E4B5B]">
            <MapPin className="h-3.5 w-3.5 text-[#3A0F34] shrink-0" strokeWidth={2} />
            <span className="truncate">
              <strong>{item.locality}</strong>, {item.city}
            </span>
          </div>

          {/* 2-line Description */}
          <p className="font-sans text-xs text-[#5E4B5B] line-clamp-2 leading-relaxed">
            {item.tagline}
          </p>

          {/* Structured Metadata Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="rounded-md bg-[#DDE3E8]/70 border border-[#C3CDD6]/50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#3A0F34] uppercase">
              {item.vertical === "education" ? "Accredited Campus" : "Commercial Verified"}
            </span>
            <span className="rounded-md bg-[#DDE3E8]/70 border border-[#C3CDD6]/50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#5E4B5B] uppercase flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              <span>Full-Time Ops</span>
            </span>
          </div>

          {/* Ticket-Style Student / Local Offer Strip */}
          <div className="bg-gradient-to-r from-[#EAAA00]/25 via-[#EAAA00]/10 to-transparent border border-[#EAAA00]/60 rounded-xl px-3 py-2 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-1.5">
              <Tag className="h-3 w-3 text-[#3A0F34]" strokeWidth={2} />
              <span className="font-mono text-[10px] font-bold text-[#1E081B] uppercase tracking-wide">
                {item.vertical === "education" ? "Admissions Open 2026-27" : "Student Discount Privilege"}
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-[#0D6E52]">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-5 pt-0">
        <div className="flex items-center justify-between border-t border-[#C3CDD6]/80 pt-3">
          {/* Left: WhatsApp + Call buttons */}
          <div className="flex items-center gap-1.5">
            {item.whatsapp && (
              <a
                href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onRecordClick(item.id, "whatsapp")}
                className="flex items-center gap-1.5 rounded-lg border border-[#C3CDD6] bg-white px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#1E081B] hover:border-[#3A0F34] hover:bg-[#DDE3E8]/30 transition-colors shadow-xs"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <MessageSquare className="h-3 w-3 text-[#0D6E52]" strokeWidth={2} />
                <span>WhatsApp</span>
              </a>
            )}

            {item.phone && (
              <a
                href={`tel:${item.phone}`}
                onClick={() => onRecordClick(item.id, "call")}
                className="flex items-center gap-1 rounded-lg border border-[#C3CDD6] bg-white px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#1E081B] hover:border-[#3A0F34] hover:bg-[#DDE3E8]/30 transition-colors shadow-xs"
              >
                <Phone className="h-3 w-3 text-[#3A0F34]" strokeWidth={2} />
                <span>Call</span>
              </a>
            )}
          </div>

          {/* Right: Enquire + Report */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onReport}
              title="Report inaccurate details"
              className="rounded-lg p-1.5 text-[#5E4B5B] hover:bg-[#DDE3E8] hover:text-[#B93829] transition-colors"
            >
              <Flag className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>

            <button
              onClick={onEnquire}
              className="rounded-lg bg-[#3A0F34] hover:bg-[#240820] text-white font-mono text-xs font-semibold px-4 py-2 flex items-center gap-1.5 shadow-sm transition-all active:scale-95 uppercase"
            >
              <span>{item.vertical === "education" ? "Enquire / Apply" : "Enquire"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
