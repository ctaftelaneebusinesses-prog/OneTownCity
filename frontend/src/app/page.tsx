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
  BookOpen,
  Briefcase,
  Layers,
  ChevronRight,
  AlertCircle,
  Plus,
  Lock,
  Activity,
  Award,
  Navigation as NavigationIcon,
  Compass,
  FileCheck2,
  HelpCircle,
  RefreshCw,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

type ListingItem = {
  id: string;
  tenant_id: string;
  vertical: "news" | "education" | "students" | "business";
  category_name: string;
  slug: string;
  name: string;
  name_te?: string | null;
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
  completeness_score?: number;
  price_or_fee_range?: string | null;
  map_url?: string | null;
  last_confirmed_at: string;
};

type NewsItem = {
  id: string;
  city: string;
  locality: string;
  item_type: "news" | "event" | "civic_project";
  title: string;
  name_te?: string | null;
  slug: string;
  content: string;
  source_name: string;
  source_url: string;
  is_confirmed_fact: boolean;
  event_date: string | null;
  event_time: string | null;
  event_venue: string | null;
  calendar_pillar?: string | null;
  organiser_contact?: string | null;
  entry_eligibility?: string | null;
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

type CategoryWithCount = {
  id: string;
  vertical: string;
  name: string;
  name_te?: string | null;
  slug: string;
  icon: string;
  listing_count: number;
};

type PublicServiceItem = {
  id: string;
  town: string;
  name: string;
  name_te?: string | null;
  category: string;
  phone: string;
  emergency_phone?: string | null;
  address: string;
  service_hours: string;
  official_source_url?: string | null;
  last_confirmed_at: string;
};

type HomepageStats = {
  total_verified_listings: number;
  total_upcoming_events: number;
  total_student_opportunities: number;
  avg_completeness_pct: number;
};

/**
 * Visual Listing Card: Cover Header, Monogram Avatar,
 * Metadata Chips, Completeness Score Pill, Price/Fee Range, Quick Actions
 */
function VisualListingCard({
  item,
  lang,
  onEnquire,
  onReport,
  onRecordClick,
  onCopyLink,
}: {
  item: ListingItem;
  lang: "en" | "te";
  onEnquire: (item: ListingItem) => void;
  onReport: (item: ListingItem) => void;
  onRecordClick: (id: string, type: "whatsapp" | "call") => void;
  onCopyLink: (slug: string) => void;
}) {
  const initialCover = getCoverImage(item.category_name, item.name);
  const [coverUrl, setCoverUrl] = useState(initialCover);
  const monogram = getMonogram(item.name);
  const metadataChips = getListingMetadataChips(item.vertical, item.category_name, item.name);
  const displayName = lang === "te" && item.name_te ? item.name_te : item.name;

  return (
    <div
      className="bg-white rounded-2xl border border-[#D8D3C8] hover:border-[#111110] transition-all duration-200 overflow-hidden flex flex-col justify-between group hover:-translate-y-0.5"
      style={{
        boxShadow: "0 1px 3px rgba(17,17,16,0.04), 0 4px 12px rgba(17,17,16,0.04)",
      }}
    >
      <div>
        {/* Cover Header */}
        <div className="relative h-[135px] w-full overflow-hidden bg-[#111110]">
          <Image
            src={coverUrl}
            alt={item.name}
            fill
            unoptimized={coverUrl.endsWith(".svg")}
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={() => setCoverUrl(GEOMETRIC_FALLBACK_SVG)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#111110]/95 via-[#111110]/40 to-transparent" />

          {/* Top-left: Category tag + Completeness Score */}
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono uppercase px-2.5 py-1 rounded-md border border-white/10 tracking-wider">
              {item.category_name}
            </span>
            {item.completeness_score !== undefined && (
              <span
                className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-md border text-white backdrop-blur-md"
                style={{
                  backgroundColor: item.completeness_score >= 90 ? "rgba(13,104,71,0.85)" : "rgba(217,119,6,0.85)",
                  borderColor: "rgba(255,255,255,0.2)",
                }}
                title={`${item.completeness_score}% Profile Completeness Score`}
              >
                {item.completeness_score}% DATA
              </span>
            )}
          </div>

          {/* Top-right: Verification Status */}
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
              <Link
                href={`/claim/${item.slug}`}
                className="bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 border border-amber-600/40 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                title="Claim this profile as owner or administrator"
              >
                <Lock className="h-2.5 w-2.5" />
                CLAIM PROFILE
              </Link>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="px-5 pt-0 pb-4 relative z-20">
          <div className="-mt-6 mb-3 flex items-center justify-between">
            <div
              className="h-11 w-11 rounded-xl bg-[#111110] text-[#F4F2EE] border-2 border-white font-bold font-serif text-lg shadow-md flex items-center justify-center shrink-0 relative z-20"
              title={displayName}
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

          <h4 className="text-base font-bold text-[#111110] group-hover:text-[#FF4F17] transition-colors tracking-tight line-clamp-1 font-mono">
            <Link href={`/listings/${item.slug}`}>{displayName}</Link>
          </h4>
          {lang === "te" && item.name_te && item.name !== item.name_te && (
            <div className="font-mono text-[11px] text-[#8B877F] truncate">
              {item.name}
            </div>
          )}

          <div className="flex items-center gap-1.5 font-mono text-xs text-[#575551] mt-1">
            <MapPin className="h-3.5 w-3.5 text-[#FF4F17] shrink-0" strokeWidth={1.75} />
            <span className="truncate">
              {item.locality}, {item.city}
            </span>
          </div>

          {item.price_or_fee_range && (
            <div className="mt-1 font-mono text-[11px] text-[#0D6847] font-semibold">
              {item.price_or_fee_range}
            </div>
          )}

          <p className="mt-2 text-xs text-[#575551] line-clamp-2 leading-relaxed">
            {item.tagline || `${item.category_name} located at ${item.address || item.locality}.`}
          </p>

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

          <div className="mt-3.5 offer-ticket">
            <div className="flex items-center gap-1.5 min-w-0 pr-2">
              <Tag className="h-3.5 w-3.5 text-[#D97706] shrink-0" strokeWidth={2} />
              <span className="font-bold text-[#111110] text-[11px] truncate">
                {item.vertical === "education"
                  ? "Admissions Open 2026-27"
                  : "Verified Local Desk"}
              </span>
            </div>
            <span className="text-[10px] text-[#0D6847] font-bold uppercase shrink-0 font-mono-numbers">
              Direct Desk
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-[#F4F2EE] border-t border-[#D8D3C8] flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.whatsapp && (
            <a
              href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello, I am enquiring about ${displayName} on OneTownCity.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onRecordClick(item.id, "whatsapp")}
              className="border border-[#D8D3C8] hover:border-[#111110] bg-white rounded-lg px-2 py-1.5 text-xs font-semibold text-[#111110] flex items-center gap-1 transition-colors pressable"
              title="Consented WhatsApp Desk"
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
              className="border border-[#D8D3C8] hover:border-[#111110] bg-white rounded-lg px-2 py-1.5 text-xs font-semibold text-[#111110] flex items-center gap-1 transition-colors pressable"
              title="Direct Helpline"
            >
              <Phone className="h-3.5 w-3.5 text-[#111110] shrink-0" strokeWidth={2} />
              <span className="hidden sm:inline">Call</span>
            </a>
          )}
          {item.map_url && (
            <a
              href={item.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#D8D3C8] hover:border-[#111110] bg-white rounded-lg px-2 py-1.5 text-xs font-semibold text-[#111110] flex items-center gap-1 transition-colors pressable"
              title="Google Maps / Directions"
            >
              <NavigationIcon className="h-3.5 w-3.5 text-[#FF4F17] shrink-0" strokeWidth={2} />
              <span className="hidden sm:inline">Map</span>
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
          className="bg-[#FF4F17] hover:bg-[#e03d07] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow-xs transition-all pressable font-mono uppercase shrink-0"
        >
          <span>Enquire</span>
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default function DiscoveryHub() {
  const { town, lang } = useTown();
  const [activeTab, setActiveTab] = useState<"all" | "news" | "education" | "students" | "business">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocality, setSelectedLocality] = useState<string>("all");
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);
  const [filterOffersOnly, setFilterOffersOnly] = useState<boolean>(false);

  // Aggregated Homepage Data
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [spotlightListings, setSpotlightListings] = useState<ListingItem[]>([]);
  const [recentlyUpdatedListings, setRecentlyUpdatedListings] = useState<ListingItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<NewsItem[]>([]);
  const [civicProjects, setCivicProjects] = useState<NewsItem[]>([]);
  const [publicServices, setPublicServices] = useState<PublicServiceItem[]>([]);
  const [homepageStats, setHomepageStats] = useState<HomepageStats | null>(null);

  // Standard Listings & Opportunities Feed
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [studentOpps, setStudentOpps] = useState<StudentOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [enquiryListing, setEnquiryListing] = useState<ListingItem | null>(null);
  const [reportListing, setReportListing] = useState<ListingItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  // Fetch Aggregated Homepage Data when town changes
  const fetchHomepageAggregate = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`${API_BASE}/homepage?town=${encodeURIComponent(town)}`, { signal });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.popular_categories || []);
        setSpotlightListings(data.spotlight_listings || []);
        setRecentlyUpdatedListings(data.whats_new || []);
        setCalendarEvents(data.happening_this_week || []);
        setCivicProjects(data.civic_tracker || []);
        setPublicServices(data.public_services || []);
        setHomepageStats(data.stats || null);
      }
    } catch (e) {
      if (!(e instanceof Error && e.name === "AbortError")) {
        console.error("Failed to load homepage aggregate:", e);
      }
    }
  }, [town]);

  // Fetch Search / Filter Listings
  const fetchListingData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      let listingsUrl = `${API_BASE}/listings?city=${encodeURIComponent(town)}`;
      if (activeTab === "education" || activeTab === "business") {
        listingsUrl += `&vertical=${activeTab}`;
      }
      if (searchQuery.trim()) {
        listingsUrl += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }

      const [resListings, resOpps] = await Promise.all([
        fetch(listingsUrl, { signal }).then((r) => (r.ok ? r.json() : [])),
        activeTab === "all" || activeTab === "students"
          ? fetch(`${API_BASE}/students/opportunities?city=${encodeURIComponent(town)}`, {
              signal,
            }).then((r) => (r.ok ? r.json() : []))
          : Promise.resolve([]),
      ]);

      if (signal?.aborted) return;
      setListings(resListings);
      setStudentOpps(resOpps);

      // Record Search Telemetry if query has text
      if (searchQuery.trim().length > 1) {
        fetch(`${API_BASE}/search/telemetry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            town,
            query_text: searchQuery.trim(),
            results_count: resListings.length,
            led_to_action: false,
          }),
        }).catch(() => {});
      }
    } catch (err: unknown) {
      if (!(err instanceof Error && err.name === "AbortError")) {
        console.error("Failed to load listing data:", err);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [town, activeTab, searchQuery]);

  useEffect(() => {
    const controller = new AbortController();
    fetchHomepageAggregate(controller.signal);
    return () => controller.abort();
  }, [fetchHomepageAggregate]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchListingData(controller.signal);
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchListingData]);

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

  const copyGeneralLink = (url: string, label: string) => {
    navigator.clipboard?.writeText(url);
    showToast(`${label} copied to clipboard`);
  };

  // Localities list for dropdown
  const localities = useMemo(() => {
    const locSet = new Set<string>();
    listings.forEach((l) => {
      if (l.locality) locSet.add(l.locality);
    });
    spotlightListings.forEach((l) => {
      if (l.locality) locSet.add(l.locality);
    });
    return Array.from(locSet).sort();
  }, [listings, spotlightListings]);

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

  // Filtered Community Calendar Events by Pillar
  const filteredCalendarEvents = useMemo(() => {
    if (selectedPillar === "all") return calendarEvents;
    return calendarEvents.filter((ev) => ev.calendar_pillar?.toLowerCase() === selectedPillar.toLowerCase());
  }, [calendarEvents, selectedPillar]);

  // Filtered Public Services by Locality
  const filteredPublicServices = useMemo(() => {
    if (selectedLocality === "all") return publicServices;
    return publicServices.filter((ps) => ps.address?.toLowerCase().includes(selectedLocality.toLowerCase()));
  }, [publicServices, selectedLocality]);

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

      {/* ─────────────────────────────────────────────────────────────
          SECTION 01: TOP COMMAND HERO
      ───────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-[#D8D3C8]"
        style={{
          background: "linear-gradient(135deg, #111110 0%, #1A1A18 60%, #242422 100%)",
          color: "#F4F2EE",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (7 cols): Editorial Masthead & Fuzzy Search Bar */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#FF4F17] animate-pulse shrink-0" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                  {town === "Nellore" ? "NELLORE" : "KUPPAM"} HYPERLOCAL NETWORK
                </span>
                <span className="font-mono text-[10px] text-[#FF4F17] font-semibold uppercase">
                  VERIFIED DIRECTORY
                </span>
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-serif">
                  {lang === "te" ? (
                    <>
                      <span style={{ color: "#FF4F17" }}>{town === "Nellore" ? "నెల్లూరు" : "కుప్పం"}</span> ప్రామాణిక విద్య, వ్యాపార &amp; పౌర సూచిక.
                    </>
                  ) : (
                    <>
                      The verified academic, civic &amp; commercial index for{" "}
                      <span style={{ color: "#FF4F17" }}>{town}</span>.
                    </>
                  )}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-neutral-300 max-w-[65ch] leading-relaxed font-sans">
                  {lang === "te"
                    ? "ఇంజనీరింగ్ కళాశాలలు, కోర్సు ప్రవేశాలు, హాస్టల్స్, ప్రభుత్వ హెల్ప్‌లైన్లు మరియు ధృవీకరించబడిన స్థానిక వ్యాపారాలు."
                    : "Higher education institutes, structured course admissions, real-time civic tracker, verified student hostels, and authenticated local storefronts."}
                </p>
              </div>

              {/* Segmented Floating Command Search Bar */}
              <div className="max-w-2xl rounded-xl bg-white p-2 shadow-lg border border-[#D8D3C8]">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 flex items-center gap-2.5 px-3 py-1">
                    <Search className="h-4 w-4 text-[#8B877F] shrink-0" strokeWidth={2} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        lang === "te"
                          ? `${town === "Nellore" ? "నెల్లూరు" : "కుప్పం"}లో కళాశాలలు, కోర్సులు, కేఫ్‌లు, ఆసుపత్రులు వెతకండి...`
                          : `Search colleges, courses, cafes, clinics in ${town}...`
                      }
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

                  {/* Locality Selector Dropdown */}
                  <div className="flex items-center gap-1.5 px-3 py-1 text-xs text-[#111110]">
                    <MapPin className="h-3.5 w-3.5 text-[#FF4F17] shrink-0" strokeWidth={1.75} />
                    <select
                      value={selectedLocality}
                      onChange={(e) => setSelectedLocality(e.target.value)}
                      className="bg-transparent font-mono text-xs font-semibold text-[#111110] outline-none cursor-pointer max-w-[130px] truncate"
                    >
                      <option value="all" className="bg-white text-[#111110]">
                        {lang === "te" ? "అన్ని ప్రాంతాలు" : "All Localities"}
                      </option>
                      {localities.map((loc) => (
                        <option key={loc} value={loc} className="bg-white text-[#111110]">
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => fetchListingData()}
                    className="text-white font-bold px-6 py-3 rounded-lg bg-[#FF4F17] hover:bg-[#e03d07] transition flex items-center justify-center gap-1.5 shrink-0 pressable font-mono text-xs uppercase shadow-sm"
                  >
                    <span>{lang === "te" ? "వెతకండి" : "Search"}</span>
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Quick Trending Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-mono text-[#FF4F17] font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>Trending:</span>
                </span>
                {[
                  { label: "B.Tech Admissions", tab: "education" as const, q: "B.Tech" },
                  { label: "Verified Hostels", tab: "students" as const, q: "Hostel" },
                  { label: "Study Cafes", tab: "business" as const, q: "Cafe" },
                  { label: "Clinics & Health", tab: "business" as const, q: "Clinic" },
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

            {/* Right Column (5 cols): Live Telemetry Bento */}
            <div className="lg:col-span-5">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-white shadow-xl space-y-4">
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

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="rounded-xl bg-black/40 p-2.5 border border-white/10">
                    <div className="text-base sm:text-lg font-bold text-white font-mono-numbers">
                      {homepageStats?.total_verified_listings || 12}+
                    </div>
                    <div className="text-[10px] text-white/70 uppercase">Verified Entities</div>
                  </div>
                  <div className="rounded-xl bg-black/40 p-2.5 border border-white/10">
                    <div className="text-base sm:text-lg font-bold text-[#0D6847] font-mono-numbers">
                      {homepageStats?.avg_completeness_pct || 92}%
                    </div>
                    <div className="text-[10px] text-white/70 uppercase">Data Completeness</div>
                  </div>
                  <div className="rounded-xl bg-black/40 p-2.5 border border-white/10">
                    <div className="text-base sm:text-lg font-bold text-[#FF4F17] font-mono-numbers">
                      100%
                    </div>
                    <div className="text-[10px] text-white/70 uppercase">Direct Desk Routing</div>
                  </div>
                </div>

                {/* Top Civic Pulse Item */}
                {civicProjects.length > 0 && (
                  <div className="rounded-xl bg-black/40 border border-white/10 p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-[#FF4F17] uppercase font-bold">
                        Civic Development Tracker
                      </span>
                      {civicProjects[0].is_confirmed_fact ? (
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
                      {civicProjects[0].title}
                    </h4>
                    <p className="font-sans text-[11px] text-white/70 line-clamp-2">
                      {civicProjects[0].content}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 02: FAST ACTIONS BAR (5 Tactile Architectural Cards)
      ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-[#D8D3C8] bg-white py-4 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            {
              title: "Engineering & Colleges",
              sub: "Admissions & Degrees",
              icon: GraduationCap,
              color: "#111110",
              action: () => {
                setActiveTab("education");
                setSearchQuery("Engineering");
              },
            },
            {
              title: "Emergency & Public Desk",
              sub: "Hospitals & Police 24/7",
              icon: ShieldCheck,
              color: "#0D6847",
              action: () => {
                const el = document.getElementById("public-services-section");
                el?.scrollIntoView({ behavior: "smooth" });
              },
            },
            {
              title: "Student Pass & Hostels",
              sub: "Zero-Fee Applications",
              icon: BookOpen,
              color: "#FF4F17",
              action: () => {
                setActiveTab("students");
              },
            },
            {
              title: "Clinics & Study Cafes",
              sub: "Local Storefronts",
              icon: Building2,
              color: "#111110",
              action: () => {
                setActiveTab("business");
              },
            },
            {
              title: "Town Event Calendar",
              sub: "6 Pillars of Activities",
              icon: Calendar,
              color: "#D97706",
              action: () => {
                const el = document.getElementById("calendar-section");
                el?.scrollIntoView({ behavior: "smooth" });
              },
            },
          ].map((card, idx) => (
            <button
              key={idx}
              onClick={card.action}
              className="p-3 rounded-xl border border-[#D8D3C8] hover:border-[#111110] bg-[#F4F2EE] hover:bg-white text-left transition-all duration-150 pressable group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <card.icon className="h-4 w-4" style={{ color: card.color }} strokeWidth={2} />
                <ArrowRight className="h-3 w-3 text-[#8B877F] group-hover:text-[#FF4F17] transition-colors" />
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-[#111110] leading-tight">
                  {card.title}
                </div>
                <div className="font-mono text-[10px] text-[#575551] mt-0.5 truncate">
                  {card.sub}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-12">
        {/* ─────────────────────────────────────────────────────────────
            SECTION 03: POPULAR LOCAL CATEGORIES (Bilingual & Counts)
        ───────────────────────────────────────────────────────────── */}
        {categories.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D3C8]">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#FF4F17] tracking-wider">
                  SECTION 03 / DIRECTORY TAXONOMY
                </span>
                <h2 className="font-mono text-base font-bold text-[#111110] uppercase tracking-tight">
                  {lang === "te" ? "ప్రధాన స్థానిక రంగాలు & కేటగిరీలు" : "Popular Local Categories"}
                </h2>
              </div>
              <span className="font-mono text-xs text-[#575551]">
                {categories.length} Verified Categories
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.slice(0, 12).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab(cat.vertical as any);
                    setSearchQuery(cat.name);
                  }}
                  className="p-3 rounded-xl border border-[#D8D3C8] bg-white hover:border-[#111110] hover:bg-[#F4F2EE] text-left transition-all pressable flex flex-col justify-between group"
                >
                  <div className="font-mono text-[10px] uppercase font-bold text-[#8B877F]">
                    {cat.vertical}
                  </div>
                  <div className="my-2">
                    <div className="font-mono text-xs font-bold text-[#111110] group-hover:text-[#FF4F17] transition-colors leading-tight line-clamp-1">
                      {lang === "te" && cat.name_te ? cat.name_te : cat.name}
                    </div>
                    {lang === "te" && cat.name_te && cat.name !== cat.name_te && (
                      <div className="font-mono text-[10px] text-[#8B877F] truncate">
                        {cat.name}
                      </div>
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-[#0D6847] font-semibold">
                    {cat.listing_count} verified {cat.listing_count === 1 ? "entry" : "entries"}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECTION 04: HAPPENING THIS WEEK & COMMUNITY CALENDAR
        ───────────────────────────────────────────────────────────── */}
        <section id="calendar-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D8D3C8]">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#FF4F17] tracking-wider">
                SECTION 04 / TOWN PULSE
              </span>
              <h2 className="font-mono text-base font-bold text-[#111110] uppercase tracking-tight flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#FF4F17]" />
                <span>Happening This Week &amp; Civic Development Tracker</span>
              </h2>
            </div>

            {/* 6 Pillars Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { label: "All", value: "all" },
                { label: "Education", value: "education" },
                { label: "Culture", value: "culture" },
                { label: "Sports", value: "sports" },
                { label: "Health Camps", value: "health camps" },
                { label: "Business Events", value: "business events" },
                { label: "Civic Activities", value: "civic activities" },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSelectedPillar(p.value)}
                  className={`font-mono text-[11px] font-bold uppercase px-2.5 py-1 rounded transition-colors pressable ${
                    selectedPillar === p.value
                      ? "bg-[#111110] text-white"
                      : "bg-white text-[#575551] border border-[#D8D3C8] hover:bg-[#EAE6DF]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCalendarEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-[#D8D3C8] p-5 space-y-3 hover:border-[#111110] transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#575551] bg-[#EAE6DF] px-2 py-0.5 rounded">
                      {ev.calendar_pillar || ev.item_type.replace("_", " ")}
                    </span>
                    {ev.is_confirmed_fact ? (
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

                  <h3 className="font-mono text-sm font-bold text-[#111110] leading-snug hover:text-[#FF4F17] transition-colors">
                    <Link href={`/news/${ev.slug}`}>{ev.title}</Link>
                  </h3>
                  <p className="font-sans text-xs text-[#575551] leading-relaxed line-clamp-3">
                    {ev.content}
                  </p>

                  {(ev.event_date || ev.event_venue) && (
                    <div className="bg-[#F4F2EE] rounded-lg p-2.5 space-y-1 font-mono text-[11px] text-[#111110]">
                      {ev.event_date && (
                        <div className="flex items-center gap-1.5 text-[#FF4F17] font-semibold">
                          <Clock className="h-3 w-3" />
                          <span>{ev.event_date} {ev.event_time ? `• ${ev.event_time}` : ""}</span>
                        </div>
                      )}
                      {ev.event_venue && (
                        <div className="flex items-center gap-1.5 text-[#575551] truncate">
                          <MapPin className="h-3 w-3 text-[#575551] shrink-0" />
                          <span>{ev.event_venue}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-[#D8D3C8] pt-3 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-[#8B877F] truncate max-w-[150px]">
                    {ev.source_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyGeneralLink(`${window.location.origin}/news/${ev.slug}`, "Event Link")}
                      className="text-[#575551] hover:text-[#111110] p-1"
                      title="Copy Shareable Link"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    {ev.source_url && (
                      <a
                        href={ev.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FF4F17] hover:underline flex items-center gap-0.5 font-bold"
                      >
                        <span>Official Source</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 05: AROUND YOUR TOWN & PUBLIC-SERVICE DIRECTORY
        ───────────────────────────────────────────────────────────── */}
        <section id="public-services-section" className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8D3C8]">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#0D6847] tracking-wider">
                SECTION 05 / PUBLIC DESK
              </span>
              <h2 className="font-mono text-base font-bold text-[#111110] uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0D6847]" />
                <span>Around Your Town: Verified Public-Service Directory</span>
              </h2>
            </div>
            <span className="font-mono text-xs text-[#0D6847] font-bold">
              Emergency &amp; Citizen Helplines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPublicServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-xl border border-[#D8D3C8] p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[9px] uppercase font-bold text-white bg-[#0D6847] px-2 py-0.5 rounded">
                      {srv.category}
                    </span>
                    <span className="font-mono text-[9px] text-[#8B877F] uppercase">
                      Confirmed
                    </span>
                  </div>

                  <h3 className="font-mono text-xs font-bold text-[#111110] leading-tight">
                    {lang === "te" && srv.name_te ? srv.name_te : srv.name}
                  </h3>
                  <div className="font-mono text-[11px] text-[#575551] mt-1 flex items-start gap-1">
                    <MapPin className="h-3 w-3 text-[#FF4F17] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{srv.address}</span>
                  </div>

                  <div className="mt-2 font-mono text-[11px] text-[#8B877F] flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{srv.service_hours}</span>
                  </div>
                </div>

                <div className="border-t border-[#D8D3C8] pt-2 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${srv.phone}`}
                    className="font-mono text-xs font-bold text-[#111110] hover:text-[#FF4F17] flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    <span>{srv.phone}</span>
                  </a>
                  {srv.emergency_phone && (
                    <a
                      href={`tel:${srv.emergency_phone}`}
                      className="font-mono text-[11px] font-bold text-white bg-[#FF4F17] px-2 py-1 rounded flex items-center gap-1 uppercase"
                    >
                      <span>Emergency {srv.emergency_phone}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 06: WHAT IS NEW? (Freshly Reconfirmed & Added)
        ───────────────────────────────────────────────────────────── */}
        {recentlyUpdatedListings.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D3C8]">
              <div>
                <span className="font-mono text-[10px] uppercase font-bold text-[#FF4F17] tracking-wider">
                  SECTION 06 / FRESHNESS LEDGER
                </span>
                <h2 className="font-mono text-base font-bold text-[#111110] uppercase tracking-tight flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#FF4F17]" />
                  <span>What Is New: Recently Reconfirmed Entities</span>
                </h2>
              </div>
              <span className="font-mono text-xs text-[#575551]">
                30-Day Freshness Standard
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentlyUpdatedListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-[#D8D3C8] p-4 flex flex-col justify-between hover:border-[#111110] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[9px] uppercase font-bold text-[#0D6847] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#0D6847]/20">
                        FRESHLY VERIFIED
                      </span>
                      <span className="font-mono text-[9px] text-[#8B877F]">
                        {new Date(item.last_confirmed_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-mono text-xs font-bold text-[#111110] hover:text-[#FF4F17] transition-colors line-clamp-1">
                      <Link href={`/listings/${item.slug}`}>{item.name}</Link>
                    </h4>
                    <p className="font-sans text-[11px] text-[#575551] line-clamp-2 mt-1">
                      {item.tagline}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#D8D3C8] flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#575551]">{item.locality}</span>
                    <Link
                      href={`/listings/${item.slug}`}
                      className="text-[#FF4F17] font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>View</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECTION 07: LOCAL INSTITUTION & BUSINESS SPOTLIGHT
        ───────────────────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D8D3C8]">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#FF4F17] tracking-wider">
                SECTION 07 / SPOTLIGHT &amp; DIRECTORY
              </span>
              <h2 className="font-mono text-base font-bold text-[#111110] uppercase tracking-tight flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#FF4F17]" />
                <span>Local Institution &amp; Business Spotlight</span>
              </h2>
            </div>

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
                All
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
                onClick={() => setActiveTab("business")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold uppercase pressable ${
                  activeTab === "business"
                    ? "bg-[#111110] text-[#F4F2EE] shadow-xs"
                    : "text-[#575551] hover:text-[#111110] hover:bg-[#EAE6DF]"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>Businesses</span>
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
                <span>Students</span>
              </button>
            </div>
          </div>

          {/* Directory Listings Grid */}
          {isLoading ? (
            <div className="rounded-2xl border border-[#D8D3C8] bg-white p-12 text-center font-mono text-xs text-[#575551] uppercase">
              Loading verified records in {town}...
            </div>
          ) : filteredListings.length === 0 ? (
            /* EMPTY STATE WITH 1-CLICK CONTRIBUTION TRIGGER */
            <div className="rounded-2xl border border-[#D8D3C8] bg-white p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#FF4F17]/10 text-[#FF4F17] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-mono text-base text-[#111110] font-bold uppercase">
                  {searchQuery
                    ? `No matching records in ${town} yet for "${searchQuery}"`
                    : `No verified entities found in ${town}`}
                </h3>
                <p className="font-mono text-xs text-[#575551] mt-1.5 max-w-md mx-auto leading-relaxed">
                  {searchQuery
                    ? `Cannot find "${searchQuery}" in our civic index? Suggest this listing now to submit it for City Admin verification.`
                    : "Help your town grow by suggesting a verified college, school, study cafe, clinic, or bookstore."}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href={searchQuery ? `/submit?title=${encodeURIComponent(searchQuery)}` : "/submit"}
                  className="rounded-lg bg-[#FF4F17] hover:bg-[#e03f0b] text-white font-mono text-xs font-bold px-5 py-2.5 uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{searchQuery ? `Suggest Listing "${searchQuery}"` : "Suggest a New Listing"}</span>
                </Link>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedLocality("all");
                    setFilterVerifiedOnly(false);
                    setFilterOffersOnly(false);
                  }}
                  className="rounded-lg border border-[#D8D3C8] bg-white hover:bg-[#F4F2EE] text-[#111110] font-mono text-xs font-semibold px-4 py-2.5 uppercase transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((item) => (
                <VisualListingCard
                  key={item.id}
                  item={item}
                  lang={lang}
                  onEnquire={(l) => setEnquiryListing(l)}
                  onReport={(l) => setReportListing(l)}
                  onRecordClick={recordClick}
                  onCopyLink={copyListingLink}
                />
              ))}
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 08: COMMUNITY CONTRIBUTION & FEEDBACK STRIP
        ───────────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-[#D8D3C8] p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8D3C8]">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#FF4F17] tracking-wider">
                SECTION 08 / CITIZEN GOVERNANCE
              </span>
              <h2 className="font-mono text-base font-bold text-[#111110] uppercase tracking-tight">
                Community Contribution &amp; Correction Studio
              </h2>
            </div>
            <span className="font-mono text-xs text-[#575551]">
              Open to All Residents
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/submit"
              className="p-4 rounded-xl border border-[#D8D3C8] hover:border-[#111110] bg-[#F4F2EE] hover:bg-white transition-all pressable group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FF4F17]/10 text-[#FF4F17] flex items-center justify-center mb-3">
                <Plus className="h-4 w-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-[#111110] group-hover:text-[#FF4F17] transition-colors uppercase">
                Suggest a Listing
              </h4>
              <p className="font-sans text-[11px] text-[#575551] mt-1 leading-relaxed">
                Add an engineering college, degree campus, bookstore, or clinic to our town index.
              </p>
            </Link>

            <Link
              href="/submit"
              className="p-4 rounded-xl border border-[#D8D3C8] hover:border-[#111110] bg-[#F4F2EE] hover:bg-white transition-all pressable group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0D6847]/10 text-[#0D6847] flex items-center justify-center mb-3">
                <Calendar className="h-4 w-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-[#111110] group-hover:text-[#0D6847] transition-colors uppercase">
                Submit a Town Event
              </h4>
              <p className="font-sans text-[11px] text-[#575551] mt-1 leading-relaxed">
                Share a campus hackathon, civic development meeting, or health camp notice.
              </p>
            </Link>

            <Link
              href="/trust"
              className="p-4 rounded-xl border border-[#D8D3C8] hover:border-[#111110] bg-[#F4F2EE] hover:bg-white transition-all pressable group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#D97706]/10 text-[#D97706] flex items-center justify-center mb-3">
                <Flag className="h-4 w-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-[#111110] group-hover:text-[#D97706] transition-colors uppercase">
                Report Inaccurate Data
              </h4>
              <p className="font-sans text-[11px] text-[#575551] mt-1 leading-relaxed">
                Flag closed storefronts, outdated contact numbers, or misleading admission details.
              </p>
            </Link>

            <Link
              href="/submit"
              className="p-4 rounded-xl border border-[#D8D3C8] hover:border-[#111110] bg-[#F4F2EE] hover:bg-white transition-all pressable group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#111110]/10 text-[#111110] flex items-center justify-center mb-3">
                <Layers className="h-4 w-4" />
              </div>
              <h4 className="font-mono text-xs font-bold text-[#111110] group-hover:text-[#FF4F17] transition-colors uppercase">
                Request Category
              </h4>
              <p className="font-sans text-[11px] text-[#575551] mt-1 leading-relaxed">
                Propose missing academic or business subcategories for our municipal review team.
              </p>
            </Link>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 09: TRUST, SAFETY & VERIFICATION CHARTER
        ───────────────────────────────────────────────────────────── */}
        <section
          className="rounded-2xl p-6 sm:p-8 text-white space-y-6"
          style={{ backgroundColor: "#111110", border: "1px solid rgba(244,242,238,0.12)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#FF4F17] tracking-wider">
                SECTION 09 / CIVIC CHARTER
              </span>
              <h2 className="font-mono text-base font-bold text-white uppercase tracking-tight">
                OneTownCity Trust, Safety &amp; Verification Charter
              </h2>
            </div>
            <span className="font-mono text-xs text-[#0D6847] bg-[#0D6847]/20 border border-[#0D6847]/40 px-2.5 py-1 rounded font-bold uppercase">
              Non-Negotiable Editorial Standards
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="font-mono text-xs font-bold text-[#FF4F17] uppercase flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Zero Paid Verification</span>
              </div>
              <p className="font-sans text-xs text-neutral-300 leading-relaxed">
                Verification badges (Owner Claimed, Details Reviewed) can never be purchased. They are strictly earned through identity verification and documented evidence audit. Sponsored placements are always clearly labeled and do not alter verification credibility.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-xs font-bold text-[#0D6847] uppercase flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Anti-Scam Student Guarantee</span>
              </div>
              <p className="font-sans text-xs text-neutral-300 leading-relaxed">
                Every internship, scholarship, and campus drive listed on OneTownCity enforces our strict Zero Application Fee rule. Never pay money to apply. Any listing requesting application fees is permanently banned.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-xs font-bold text-[#D97706] uppercase flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4 shrink-0" />
                <span>30-Day Freshness Guarantee</span>
              </div>
              <p className="font-sans text-xs text-neutral-300 leading-relaxed">
                Institutions and local businesses must reconfirm their operating hours, contact helplines, and fee schedules every 30 days. Listings that lapse are automatically demoted until re-audited.
              </p>
            </div>
          </div>
        </section>
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