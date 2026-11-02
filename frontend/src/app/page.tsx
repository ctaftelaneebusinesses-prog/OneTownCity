"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTown } from "@/components/TownContext";
import { EnquiryModal } from "@/components/EnquiryModal";
import { ReportModal } from "@/components/ReportModal";
import {
  getCoverImage,
  getMonogram,
  getListingMetadataChips,
  GEOMETRIC_FALLBACK_SVG,
} from "@/lib/covers";
import {
  Search,
  CheckCircle2,
  Building2,
  GraduationCap,
  Calendar,
  ExternalLink,
  MessageSquare,
  Phone,
  Flag,
  Tag,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Share2,
  X,
  FileCheck2,
  BookOpen,
  Briefcase,
  Layers,
  ChevronRight,
  AlertCircle,
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
  opportunity_type:
    | "internship"
    | "scholarship"
    | "hackathon"
    | "admission_drive"
    | "student_hostel"
    | "student_discount";
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

/**
 * Embedded SVG: Civic Development & Verification Pipeline
 * Visualizing how citizen/town proposals move from Submitted -> Source Audited -> Confirmed Fact
 * and listings move from Unverified -> Owner Claimed -> Details Reviewed
 */
function CivicPipelineDiagram() {
  return (
    <div
      className="p-4 rounded-xl border border-[#D8D3C8] bg-white space-y-3"
      style={{ boxShadow: "0 1px 3px rgba(17,17,16,0.04)" }}
    >
      <div className="flex items-center justify-between border-b border-[#D8D3C8] pb-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#111110]">
          Civic Audit &amp; Verification Pipeline
        </span>
        <span className="font-mono text-[9px] text-[#0D6847] font-bold uppercase">
          Autonomous Protocol
        </span>
      </div>

      <svg
        viewBox="0 0 480 90"
        className="w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Step 1 */}
        <rect x="4" y="10" width="130" height="70" rx="6" fill="#F4F2EE" stroke="#D8D3C8" strokeWidth="1" />
        <text x="14" y="30" fill="#8B877F" fontSize="9" fontFamily="JetBrains Mono" fontWeight="700">PHASE 01</text>
        <text x="14" y="48" fill="#111110" fontSize="11" fontFamily="Plus Jakarta Sans" fontWeight="700">Civic Submission</text>
        <text x="14" y="65" fill="#575551" fontSize="9" fontFamily="JetBrains Mono">Owner / Citizen File</text>

        {/* Arrow 1 */}
        <path d="M142 45 H166 M162 40 L168 45 L162 50" stroke="#FF4F17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Step 2 */}
        <rect x="174" y="10" width="130" height="70" rx="6" fill="#F4F2EE" stroke="#D8D3C8" strokeWidth="1" />
        <text x="184" y="30" fill="#8B877F" fontSize="9" fontFamily="JetBrains Mono" fontWeight="700">PHASE 02</text>
        <text x="184" y="48" fill="#111110" fontSize="11" fontFamily="Plus Jakarta Sans" fontWeight="700">Evidence Audit</text>
        <text x="184" y="65" fill="#575551" fontSize="9" fontFamily="JetBrains Mono">Cross-Source Verified</text>

        {/* Arrow 2 */}
        <path d="M312 45 H336 M332 40 L338 45 L332 50" stroke="#0D6847" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Step 3 */}
        <rect x="344" y="10" width="132" height="70" rx="6" fill="#ECFDF5" stroke="#0D6847" strokeWidth="1" />
        <text x="354" y="30" fill="#0D6847" fontSize="9" fontFamily="JetBrains Mono" fontWeight="700">PHASE 03</text>
        <text x="354" y="48" fill="#0D6847" fontSize="11" fontFamily="Plus Jakarta Sans" fontWeight="800">Confirmed Fact</text>
        <text x="354" y="65" fill="#0D6847" fontSize="9" fontFamily="JetBrains Mono">Sealed &amp; Indexed</text>
      </svg>
    </div>
  );
}

/**
 * Visual Listing Card: 130px Cover Header, Scrim,
 * Monogram Avatar, Structured Metadata Chips & Perforated Offer Pass
 */
function VisualListingCard({
  item,
  onEnquire,
  onReport,
  onRecordClick,
  onCopyLink,
}: {
  item: ListingItem;
  onEnquire: (item: ListingItem) => void;
  onReport: (item: ListingItem) => void;
  onRecordClick: (id: string, type: "whatsapp" | "call") => void;
  onCopyLink: (slug: string) => void;
}) {
  const initialCover = getCoverImage(item.category_name, item.name);
  const [coverUrl, setCoverUrl] = useState(initialCover);
  const monogram = getMonogram(item.name);
  const metadataChips = getListingMetadataChips(item.vertical, item.category_name, item.name);

  return (
    <div
      className="bg-white rounded-2xl border border-[#D8D3C8] hover:border-[#111110] transition-all duration-200 overflow-hidden flex flex-col justify-between group hover:-translate-y-0.5"
      style={{
        boxShadow: "0 1px 3px rgba(17,17,16,0.04), 0 4px 12px rgba(17,17,16,0.04)",
      }}
    >
      <div>
        {/* 130px Visual Cover Header */}
        <div className="relative h-[130px] w-full overflow-hidden bg-[#111110]">
          <Image
            src={coverUrl}
            alt={item.name}
            fill
            unoptimized={coverUrl.endsWith(".svg")}
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={() => setCoverUrl(GEOMETRIC_FALLBACK_SVG)}
          />

          {/* Dark bottom gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111110]/95 via-[#111110]/40 to-transparent" />

          {/* Top-left floating pill: Category tag */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono uppercase px-2.5 py-1 rounded-md border border-white/10 tracking-wider">
              {item.category_name}
            </span>
          </div>

          {/* Top-right floating pills: Sponsored & Verification badges */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
            {item.is_sponsored && (
              <span className="bg-[#D97706] text-white font-bold text-[9px] font-mono uppercase px-2 py-0.5 rounded-md shadow-xs">
                SPONSORED
              </span>
            )}
            {item.verification_status === "details_reviewed" && (
              <span className="bg-[#0D6847] text-white text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2.5} />
                DETAILS REVIEWED
              </span>
            )}
            {item.verification_status === "owner_claimed" && (
              <span className="bg-[#111110] text-[#D97706] border border-[#D97706]/40 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5" strokeWidth={2} />
                OWNER CLAIMED
              </span>
            )}
            {item.verification_status === "not_verified" && (
              <span className="bg-neutral-900/80 text-neutral-300 text-[9px] font-mono uppercase px-2 py-0.5 rounded-md">
                UNVERIFIED
              </span>
            )}
          </div>
        </div>

        {/* Card Body with Overlapping Monogram Avatar */}
        <div className="px-5 pt-0 pb-4 relative z-20">
          {/* Overlapping Monogram along bottom edge of cover */}
          <div className="-mt-6 mb-3 flex items-center justify-between">
            <div
              className="h-11 w-11 rounded-xl bg-[#111110] text-[#F4F2EE] border-2 border-white font-bold font-serif text-lg shadow-md flex items-center justify-center shrink-0 relative z-20"
              title={item.name}
            >
              {monogram}
            </div>
            <button
              onClick={() => onCopyLink(item.slug)}
              className="rounded-lg p-1.5 text-[#575551] hover:bg-[#EAE6DF] hover:text-[#111110] transition-colors pressable"
              title="Copy Listing Canonical Link"
            >
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>

          {/* Title & Canonical Link */}
          <h4 className="text-base font-bold text-[#111110] group-hover:text-[#FF4F17] transition-colors tracking-tight line-clamp-1 font-mono">
            <Link href={`/listings/${item.slug}`}>{item.name}</Link>
          </h4>

          {/* Locality Pin + Address */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-[#575551] mt-1">
            <MapPin className="h-3.5 w-3.5 text-[#FF4F17] shrink-0" strokeWidth={1.75} />
            <span className="truncate">
              {item.locality}, {item.city}
            </span>
          </div>

          {/* 2-Line Description */}
          <p className="mt-2 text-xs text-[#575551] line-clamp-2 leading-relaxed">
            {item.tagline || `${item.category_name} located at ${item.address || item.locality}.`}
          </p>

          {/* Structured Metadata Chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {metadataChips.map((chip, idx) => (
              <span
                key={idx}
                className="bg-[#EAE6DF] text-[#111110] text-[11px] font-medium px-2 py-0.5 rounded font-mono"
              >
                {chip}
              </span>
            ))}
          </div>

          {/* Ticket-Style Student / Local Offer Strip */}
          <div className="mt-3.5 offer-ticket">
            <div className="flex items-center gap-1.5 min-w-0 pr-2">
              <Tag className="h-3.5 w-3.5 text-[#D97706] shrink-0" strokeWidth={2} />
              <span className="font-bold text-[#111110] text-[11px] truncate">
                {item.vertical === "education"
                  ? "Admissions Open 2026-27"
                  : "Student & Local Pass Verified"}
              </span>
            </div>
            <span className="text-[10px] text-[#0D6847] font-bold uppercase shrink-0 font-mono-numbers">
              Direct Lead
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-[#F4F2EE] border-t border-[#D8D3C8] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {item.whatsapp && (
            <a
              href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onRecordClick(item.id, "whatsapp")}
              className="border border-[#D8D3C8] hover:border-[#111110] bg-white rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#111110] flex items-center gap-1.5 transition-colors pressable"
              title="WhatsApp Direct Routing"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600 shrink-0" strokeWidth={2} />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
          {item.phone && (
            <a
              href={`tel:${item.phone}`}
              onClick={() => onRecordClick(item.id, "call")}
              className="border border-[#D8D3C8] hover:border-[#111110] bg-white rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#111110] flex items-center gap-1.5 transition-colors pressable"
              title="Telephone Helpline"
            >
              <Phone className="h-3.5 w-3.5 text-[#111110] shrink-0" strokeWidth={2} />
              <span className="hidden sm:inline">Call</span>
            </a>
          )}
          <button
            onClick={() => onReport(item)}
            className="p-1.5 text-[#8B877F] hover:text-[#FF4F17] hover:bg-white rounded-lg transition-colors pressable"
            title="Report inaccurate details"
          >
            <Flag className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>

        <button
          onClick={() => onEnquire(item)}
          className="bg-[#FF4F17] hover:bg-[#e03d07] text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all pressable font-mono uppercase"
        >
          <span>Enquire / Apply</span>
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

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

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

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
    }, 180);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const recordClick = async (listingId: string, clickType: "whatsapp" | "call") => {
    try {
      await fetch(`${API_BASE}/telemetry/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, click_type: clickType }),
      });
      showToast(clickType === "whatsapp" ? "Opening verified WhatsApp link..." : "Calling provider telephone...");
    } catch (e) {
      console.error("Telemetry error:", e);
    }
  };

  const copyListingLink = (slug: string) => {
    const url = `${window.location.origin}/listings/${slug}`;
    navigator.clipboard?.writeText(url);
    showToast("Listing link copied to clipboard");
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
    <div style={{ backgroundColor: "#F4F2EE", minHeight: "100vh" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-modal-enter">
          <div className="bg-[#111110] text-[#F4F2EE] border border-[#D8D3C8]/40 px-4 py-2.5 rounded-lg font-mono text-xs flex items-center gap-2 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-[#FF4F17]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. ARCHITECTURAL 2-COLUMN SPLIT HERO SECTION (NO GRAPH GRID LINES) */}
      <section
        className="relative overflow-hidden pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-[#D8D3C8]"
        style={{
          background: "linear-gradient(135deg, #111110 0%, #1A1A18 60%, #242422 100%)",
          color: "#F4F2EE",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (7 cols): Editorial Headline & Floating Search Command */}
            <div className="lg:col-span-7 space-y-6">
              {/* Region Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#FF4F17] animate-pulse shrink-0" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                  KUPPAM &amp; NELLORE HYPERLOCAL NETWORK
                </span>
                <span className="font-mono text-[10px] text-[#FF4F17] font-semibold uppercase">
                  VERIFIED DIRECTORY
                </span>
              </div>

              {/* High-Impact Headline with Tighter Tracking */}
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif">
                  The verified academic, civic &amp; commercial index for{" "}
                  <span style={{ color: "#FF4F17" }}>{town}</span>.
                </h1>
                <p className="mt-3 text-sm sm:text-base text-neutral-300 max-w-[65ch] leading-relaxed font-sans">
                  Higher education institutes, structured course admissions, real-time civic tracker,
                  safe student hostels, and authenticated local storefronts.
                </p>
              </div>

              {/* Segmented Floating Command Search Bar */}
              <div className="max-w-2xl rounded-xl bg-white p-2 shadow-lg border border-[#D8D3C8]">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Segment 1: Search Input with Icon */}
                  <div className="flex-1 flex items-center gap-2.5 px-3 py-1">
                    <Search className="h-4 w-4 text-[#8B877F] shrink-0" strokeWidth={2} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search colleges, courses, cafes, scholarships in ${town}...`}
                      className="w-full bg-transparent font-sans text-xs text-[#111110] placeholder-[#8B877F] outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="font-mono text-[10px] text-[#575551] hover:text-[#111110] uppercase px-1.5 py-0.5 rounded-md bg-[#EAE6DF] pressable"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="hidden sm:block h-7 w-[1px] bg-[#D8D3C8]" />

                  {/* Segment 2: Locality Selector Dropdown */}
                  <div className="flex items-center gap-1.5 px-3 py-1 text-xs text-[#111110]">
                    <MapPin className="h-3.5 w-3.5 text-[#FF4F17] shrink-0" strokeWidth={1.75} />
                    <select
                      value={selectedLocality}
                      onChange={(e) => setSelectedLocality(e.target.value)}
                      className="bg-transparent font-mono text-xs font-semibold text-[#111110] outline-none cursor-pointer max-w-[130px] truncate"
                    >
                      <option value="all" className="bg-white text-[#111110]">
                        All Localities
                      </option>
                      {localities.map((loc) => (
                        <option key={loc} value={loc} className="bg-white text-[#111110]">
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Segment 3: Signal Vermilion Button with Tactile Feedback */}
                  <button
                    onClick={() => fetchData()}
                    className="text-white font-bold px-6 py-3 rounded-lg bg-[#FF4F17] hover:bg-[#e03d07] transition flex items-center justify-center gap-1.5 shrink-0 pressable font-mono text-xs uppercase shadow-sm"
                  >
                    <span>Search</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Quick Trending Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-mono text-[#FF4F17] font-semibold flex items-center gap-1">
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
                    className="bg-white/10 hover:bg-white/20 text-white text-xs rounded-full border border-white/15 px-3 py-1 transition-all backdrop-blur-xs font-sans pressable-subtle"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column (5 cols) — Floating "Town Pulse" Bento Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-white shadow-xl space-y-4">
                {/* Header with Live Telemetry */}
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#FF4F17]" strokeWidth={2} />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                      Live Town Telemetry
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#FF4F17] bg-white/10 border border-[#FF4F17]/40 px-2 py-0.5 rounded-full font-bold">
                    {town} Live
                  </span>
                </div>

                {/* Live Town Telemetry Counters */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="rounded-xl bg-black/40 p-2.5 border border-white/10">
                    <div className="text-base sm:text-lg font-bold text-white font-mono-numbers">30+</div>
                    <div className="text-[10px] text-white/70 uppercase">Active Listings</div>
                  </div>
                  <div className="rounded-xl bg-black/40 p-2.5 border border-white/10">
                    <div className="text-base sm:text-lg font-bold text-[#0D6847] font-mono-numbers">100%</div>
                    <div className="text-[10px] text-white/70 uppercase">Reviewed Facts</div>
                  </div>
                  <div className="rounded-xl bg-black/40 p-2.5 border border-white/10">
                    <div className="text-base sm:text-lg font-bold text-[#FF4F17] font-mono-numbers">Direct</div>
                    <div className="text-[10px] text-white/70 uppercase">Lead Routing</div>
                  </div>
                </div>

                {/* Top Civic / Campus Headline */}
                {topNews && (
                  <div className="rounded-xl bg-black/40 border border-white/10 p-3 space-y-1.5 transition-colors hover:bg-black/50">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-[#FF4F17] uppercase font-bold">
                        Top Civic Headline
                      </span>
                      {topNews.is_confirmed_fact ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[#0D6847] px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase">
                          <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2.5} />
                          Confirmed Fact
                        </span>
                      ) : (
                        <span className="rounded bg-[#D97706] px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase">
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
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        onClick={() => setActiveTab("news")}
                        className="text-[10px] text-[#FF4F17] hover:underline font-mono font-bold flex items-center gap-1 pressable"
                      >
                        <span>Jump to Pulse</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Featured Student Opportunity */}
                {topOpp && (
                  <div className="rounded-xl bg-black/40 border border-white/10 p-3 space-y-1.5 transition-colors hover:bg-black/50">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-[#FF4F17] uppercase font-bold">
                        Featured Opportunity
                      </span>
                      {topOpp.stipend_amount && (
                        <span className="rounded bg-[#FF4F17] text-white font-mono font-bold text-[9px] px-2 py-0.5 font-mono-numbers">
                          {topOpp.stipend_amount}
                        </span>
                      )}
                    </div>
                    <h4 className="font-mono text-xs font-bold text-white line-clamp-1">
                      {topOpp.title}
                    </h4>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-white/60 font-mono truncate max-w-[170px]">
                        By {topOpp.provider_name}
                      </span>
                      <button
                        onClick={() => setActiveTab("students")}
                        className="text-[10px] text-[#FF4F17] hover:underline font-mono font-bold flex items-center gap-1 pressable shrink-0"
                      >
                        <span>Apply / View</span>
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

      {/* 2. MULTI-SECTION PORTAL MAIN CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Sticky Segmented Filter & Quick-Stats Bar */}
        <div className="sticky top-16 z-30 bg-white p-2 rounded-xl border border-[#D8D3C8] shadow-sm flex flex-wrap items-center justify-between gap-4">
          {/* Vertical Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold uppercase pressable ${
                activeTab === "all"
                  ? "bg-[#111110] text-[#F4F2EE] shadow-xs"
                  : "text-[#575551] hover:text-[#111110] hover:bg-[#EAE6DF]"
              }`}
            >
              All Verticals
            </button>
            <button
              onClick={() => setActiveTab("education")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold uppercase pressable ${
                activeTab === "education"
                  ? "bg-[#111110] text-[#F4F2EE] shadow-xs"
                  : "text-[#575551] hover:text-[#111110] hover:bg-[#EAE6DF]"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Education Hub</span>
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold uppercase pressable ${
                activeTab === "students"
                  ? "bg-[#111110] text-[#F4F2EE] shadow-xs"
                  : "text-[#575551] hover:text-[#111110] hover:bg-[#EAE6DF]"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Student Corner</span>
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold uppercase pressable ${
                activeTab === "news"
                  ? "bg-[#111110] text-[#F4F2EE] shadow-xs"
                  : "text-[#575551] hover:text-[#111110] hover:bg-[#EAE6DF]"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>News &amp; Town Pulse</span>
            </button>
            <button
              onClick={() => setActiveTab("business")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold uppercase pressable ${
                activeTab === "business"
                  ? "bg-[#111110] text-[#F4F2EE] shadow-xs"
                  : "text-[#575551] hover:text-[#111110] hover:bg-[#EAE6DF]"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Local Businesses</span>
            </button>
          </div>

          {/* Instant Filter Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold uppercase border pressable ${
                filterVerifiedOnly
                  ? "bg-[#0D6847] text-white border-[#0D6847] shadow-xs"
                  : "bg-transparent text-[#575551] border-[#D8D3C8] hover:bg-[#EAE6DF]"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Verified Only</span>
            </button>

            <button
              onClick={() => setFilterOffersOnly(!filterOffersOnly)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-semibold uppercase border pressable ${
                filterOffersOnly
                  ? "bg-[#FF4F17] text-white border-[#FF4F17] shadow-xs font-bold"
                  : "bg-transparent text-[#575551] border-[#D8D3C8] hover:bg-[#EAE6DF]"
              }`}
            >
              <Tag className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span>Active Offers</span>
            </button>
          </div>
        </div>

        {/* 3. VIEW SWITCHER OR ASYMMETRIC MAIN GRID */}
        {activeTab === "all" ? (
          /* ASYMMETRIC 8-COL DIRECTORY + 4-COL CIVIC SIDEBAR */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Listings Column (8 cols): Featured Institutions & Businesses Grid */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-[#D8D3C8]">
                <h3 className="font-mono text-xs font-bold text-[#111110] uppercase tracking-wider flex items-center gap-2">
                  <div className="h-3 w-1 bg-[#FF4F17] rounded-xs" />
                  <span>Featured Institutions &amp; Local Businesses ({filteredListings.length})</span>
                </h3>
                <span className="font-mono text-[11px] text-[#575551] uppercase font-mono-numbers">
                  Verified Directory Index
                </span>
              </div>

              {isLoading ? (
                <div className="rounded-2xl border border-[#D8D3C8] bg-white p-12 text-center font-mono text-xs text-[#575551] uppercase">
                  Loading verified entities in {town}...
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="rounded-2xl border border-[#D8D3C8] bg-white p-12 text-center space-y-3">
                  <p className="font-mono text-sm text-[#111110] font-bold uppercase">
                    No matching verified entities found in {town}
                  </p>
                  <p className="font-mono text-xs text-[#575551]">
                    Try clearing search filters or choosing a different locality.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedLocality("all");
                      setFilterVerifiedOnly(false);
                      setFilterOffersOnly(false);
                    }}
                    className="rounded-lg bg-[#111110] text-[#F4F2EE] font-mono text-xs px-4 py-2 uppercase hover:bg-[#242422] pressable"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredListings.map((item) => (
                    <VisualListingCard
                      key={item.id}
                      item={item}
                      onEnquire={(l) => setEnquiryListing(l)}
                      onReport={(l) => setReportListing(l)}
                      onRecordClick={recordClick}
                      onCopyLink={copyListingLink}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Sticky Sidebar (4 cols): Widget 1 & Widget 2 */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
              {/* Widget 1: Live Town Pulse & Civic Tracker */}
              <div className="bg-white rounded-2xl border border-[#D8D3C8] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#D8D3C8] pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#FF4F17]" strokeWidth={2} />
                    <h3 className="font-mono text-xs font-bold text-[#111110] uppercase tracking-wide">
                      Live Town Pulse &amp; Civic Tracker
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("news")}
                    className="font-mono text-[10px] text-[#FF4F17] hover:underline font-bold uppercase transition-colors pressable"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-3">
                  {newsItems.slice(0, 3).map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-xl bg-[#F4F2EE] border border-[#D8D3C8] space-y-1.5 transition-all hover:border-[#111110] pressable-subtle"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[9px] uppercase font-bold text-[#575551]">
                          {n.item_type.replace("_", " ")}
                        </span>
                        {n.is_confirmed_fact ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-[#0D6847] uppercase">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Confirmed Fact
                          </span>
                        ) : (
                          <span className="font-mono text-[9px] font-bold text-[#D97706] uppercase">
                            Proposal
                          </span>
                        )}
                      </div>
                      <h4 className="font-mono text-xs font-bold text-[#111110] line-clamp-2">
                        {n.title}
                      </h4>
                      <p className="font-sans text-[11px] text-[#575551] line-clamp-2 leading-relaxed">
                        {n.content}
                      </p>
                      {n.source_url && (
                        <div className="pt-1 flex items-center justify-between font-mono text-[10px]">
                          <span className="text-[#8B877F] truncate max-w-[180px]">
                            Source: {n.source_name}
                          </span>
                          <a
                            href={n.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FF4F17] hover:underline flex items-center gap-0.5"
                          >
                            <span>Verify</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Embedded Civic Pipeline Diagram */}
                <CivicPipelineDiagram />
              </div>

              {/* Widget 2: Student Corner & Scholarships Box */}
              <div
                className="rounded-2xl p-5 text-white space-y-4"
                style={{
                  backgroundColor: "#111110",
                  border: "1px solid rgba(244,242,238,0.12)",
                }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#FF4F17]" strokeWidth={2} />
                    <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wide">
                      Student Corner Matrix
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab("students")}
                    className="font-mono text-[10px] text-[#FF4F17] hover:underline font-bold uppercase transition-colors pressable"
                  >
                    View All
                  </button>
                </div>

                {/* Compact Consumer Protection Notice (No standalone giant purple banner) */}
                <div className="student-protection-inline text-white/90">
                  <AlertCircle className="h-3.5 w-3.5 text-[#FF4F17] shrink-0" />
                  <span>ANTI-SCAM: ZERO APPLICATION FEES PERMITTED</span>
                </div>

                {/* Student Opportunities Mini-Feed */}
                <div className="space-y-3 pt-1">
                  {studentOpps.slice(0, 3).map((opp) => (
                    <div
                      key={opp.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5 transition-colors hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[9px] uppercase font-bold text-[#FF4F17]">
                          {opp.opportunity_type.replace("_", " ")}
                        </span>
                        {opp.stipend_amount && (
                          <span className="font-mono text-[9px] font-bold text-white bg-[#FF4F17] px-2 py-0.5 rounded font-mono-numbers">
                            {opp.stipend_amount}
                          </span>
                        )}
                      </div>
                      <h4 className="font-mono text-xs font-bold text-white line-clamp-1">
                        {opp.title}
                      </h4>
                      <p className="font-sans text-[11px] text-white/70 line-clamp-1">
                        {opp.description}
                      </p>
                      <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-white/50">
                        <span>By {opp.provider_name}</span>
                        <a
                          href={opp.apply_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FF4F17] hover:underline font-bold"
                        >
                          Apply Direct
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "news" ? (
          /* DEDICATED NEWS & CIVIC PULSE TAB */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D3C8]">
              <h2 className="font-mono text-base font-bold text-[#111110] uppercase tracking-tight flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#FF4F17]" />
                <span>Verified Civic Development Tracker &amp; Town Events</span>
              </h2>
              <span className="font-mono text-xs text-[#575551]">
                {newsItems.length} Verified Entries
              </span>
            </div>

            {/* Civic Verification Pipeline SVG */}
            <CivicPipelineDiagram />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map((n) => (
                <div
                  key={n.id}
                  className="bg-white rounded-2xl border border-[#D8D3C8] p-5 space-y-3 hover:border-[#111110] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#575551] bg-[#EAE6DF] px-2 py-0.5 rounded">
                      {n.item_type.replace("_", " ")}
                    </span>
                    {n.is_confirmed_fact ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-[#0D6847] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#0D6847]/20 uppercase">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Confirmed Fact
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] font-bold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#D97706]/20 uppercase">
                        Proposal
                      </span>
                    )}
                  </div>

                  <h3 className="font-mono text-sm font-bold text-[#111110] leading-snug">
                    {n.title}
                  </h3>
                  <p className="font-sans text-xs text-[#575551] leading-relaxed">
                    {n.content}
                  </p>

                  <div className="border-t border-[#D8D3C8] pt-3 flex items-center justify-between font-mono text-[11px] text-[#8B877F]">
                    <span>Source: {n.source_name}</span>
                    {n.source_url && (
                      <a
                        href={n.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FF4F17] hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>Source Link</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "students" ? (
          /* DEDICATED STUDENT CORNER MATRIX */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D3C8]">
              <h2 className="font-mono text-base font-bold text-[#111110] uppercase tracking-tight flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#FF4F17]" />
                <span>Student Hub: Internships, Scholarships &amp; Verified Hostels</span>
              </h2>
              <span className="font-mono text-xs text-[#575551]">
                {studentOpps.length} Opportunities
              </span>
            </div>

            {/* Consumer Protection Notice Banner */}
            <div className="bg-[#111110] text-white p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF4F17] animate-pulse shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FF4F17]">
                  Student Protection Protocol
                </span>
                <span className="font-sans text-xs text-neutral-300 hidden sm:inline">
                  Zero application fees permitted. Never pay money to apply for any student internship, scholarship, or drive.
                </span>
              </div>
              <span className="font-mono text-[10px] text-white/50 uppercase shrink-0">
                100% Enforced
              </span>
            </div>

            {/* Horizontal Matrix / Ledger */}
            <div className="space-y-4">
              {studentOpps.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-white rounded-xl border border-[#D8D3C8] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#111110] transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold uppercase text-[#FF4F17] bg-[#FF4F17]/10 px-2.5 py-0.5 rounded">
                        {opp.opportunity_type.replace("_", " ")}
                      </span>
                      {opp.stipend_amount && (
                        <span className="font-mono text-xs font-bold text-[#0D6847] bg-[#ECFDF5] px-2.5 py-0.5 rounded border border-[#0D6847]/20 font-mono-numbers">
                          {opp.stipend_amount}
                        </span>
                      )}
                      {opp.deadline && (
                        <span className="font-mono text-[11px] text-[#8B877F] flex items-center gap-1 font-mono-numbers">
                          <Clock className="h-3 w-3" />
                          <span>Deadline: {opp.deadline}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-mono text-base font-bold text-[#111110]">
                      {opp.title}
                    </h3>
                    <p className="font-sans text-xs text-[#575551] leading-relaxed max-w-[85ch]">
                      {opp.description}
                    </p>
                    {opp.eligibility && (
                      <div className="font-mono text-[11px] text-[#575551]">
                        Eligibility: <strong className="text-[#111110]">{opp.eligibility}</strong>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                    <div className="text-right font-mono text-[11px] text-[#8B877F] hidden sm:block">
                      <div>Offered by</div>
                      <div className="font-bold text-[#111110] truncate max-w-[150px]">
                        {opp.provider_name}
                      </div>
                    </div>
                    {opp.apply_url && (
                      <a
                        href={opp.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#FF4F17] hover:bg-[#e03d07] text-white font-mono text-xs font-bold uppercase px-4 py-2.5 rounded-lg flex items-center gap-1.5 pressable shadow-xs"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* DEDICATED VERTICAL LISTING GRID (Education Hub or Local Businesses) */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D3C8]">
              <h2 className="font-mono text-base font-bold text-[#111110] uppercase tracking-tight flex items-center gap-2">
                {activeTab === "education" ? (
                  <>
                    <GraduationCap className="h-4 w-4 text-[#FF4F17]" />
                    <span>Education Hub: Colleges, Schools &amp; Academies</span>
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 text-[#FF4F17]" />
                    <span>Local Commercial Storefronts, Cafes &amp; Bookstores</span>
                  </>
                )}
              </h2>
              <span className="font-mono text-xs text-[#575551]">
                {filteredListings.length} Entities
              </span>
            </div>

            {filteredListings.length === 0 ? (
              <div className="rounded-2xl border border-[#D8D3C8] bg-white p-12 text-center font-mono text-xs text-[#575551] uppercase">
                No verified listings found in {town} for this vertical.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((item) => (
                  <VisualListingCard
                    key={item.id}
                    item={item}
                    onEnquire={(l) => setEnquiryListing(l)}
                    onReport={(l) => setReportListing(l)}
                    onRecordClick={recordClick}
                    onCopyLink={copyListingLink}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Enquiry Modal */}
      <EnquiryModal
        isOpen={Boolean(enquiryListing)}
        onClose={() => setEnquiryListing(null)}
        listing={enquiryListing}
        apiUrl={API_BASE}
      />

      {/* Interactive Report Issue Modal */}
      <ReportModal
        isOpen={Boolean(reportListing)}
        onClose={() => setReportListing(null)}
        listing={reportListing}
        apiUrl={API_BASE}
      />
    </div>
  );
}
