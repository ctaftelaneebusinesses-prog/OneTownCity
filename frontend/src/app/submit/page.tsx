"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building,
  GraduationCap,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Send,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

type CategoryItem = {
  id: string;
  vertical: string;
  name: string;
  slug: string;
};

function SubmitStudioContent() {
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get("title") || "";
  const initialTab = searchParams.get("tab") || "listing";

  const [activeTab, setActiveTab] = useState<"listing" | "news" | "category">(
    initialTab === "news" ? "news" : initialTab === "category" ? "category" : "listing"
  );

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; message: string; type: string } | null>(null);

  // Form 1: Listing
  const [listingForm, setListingForm] = useState({
    name: initialTitle,
    vertical: "education" as "education" | "business",
    city: "Nellore",
    category_id: "",
    address: "",
    phone: "",
    whatsapp: "",
    website: "",
    email: "",
    description: "",
  });

  // Form 2: News / Event
  const [newsForm, setNewsForm] = useState({
    title: initialTitle,
    city: "Nellore",
    item_type: "news" as "news" | "event" | "campus_notice" | "civic_development",
    content: "",
    source_name: "",
    source_url: "",
    is_confirmed_fact: true,
    event_date: "",
    event_time: "",
    event_venue: "",
  });

  // Form 3: Category Request
  const [categoryForm, setCategoryForm] = useState({
    vertical: "education" as "news" | "education" | "students" | "business",
    proposed_name: "",
    justification: "",
    email: "",
  });

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${API_BASE}/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          // Set default category for selected vertical
          const firstForVertical = data.find((c: CategoryItem) => c.vertical === "education");
          if (firstForVertical) {
            setListingForm((prev) => ({ ...prev, category_id: firstForVertical.id }));
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Update categories when vertical changes
  const filteredCategories = categories.filter((c) => c.vertical === listingForm.vertical);

  const handleListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingForm.name.trim() || !listingForm.address.trim() || !listingForm.phone.trim()) {
      toast.error("Please fill in name, address, and telephone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/submissions/listing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...listingForm,
          category_id: listingForm.category_id || undefined,
          whatsapp: listingForm.whatsapp || undefined,
          website: listingForm.website || undefined,
          email: listingForm.email || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setSuccessData({
        id: data.listing_id,
        message: "Your listing has been recorded and submitted to the City Admin moderation queue. All new listings require administrative review before appearing in the public index.",
        type: "Listing",
      });
      toast.success("Listing submitted for review");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error submitting listing");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title.trim() || !newsForm.content.trim() || !newsForm.source_url.trim()) {
      toast.error("Title, content, and official source URL are mandatory.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/submissions/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...newsForm,
          event_date: newsForm.event_date || undefined,
          event_time: newsForm.event_time || undefined,
          event_venue: newsForm.event_venue || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "News submission failed");
      }

      setSuccessData({
        id: data.news_id,
        message: "Your town update has been recorded. Our editorial board verifies source documentation and fact-check citations before approving civic records.",
        type: "Town Update",
      });
      toast.success("Town update submitted for review");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error submitting news");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.proposed_name.trim() || !categoryForm.justification.trim()) {
      toast.error("Please enter a proposed category name and justification.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/submissions/category-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(categoryForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Category request failed");
      }

      setSuccessData({
        id: data.request_id,
        message: "Your category extension request has been forwarded to the Central Governance board. New categories must conform strictly to our 4 core verticals.",
        type: "Category Request",
      });
      toast.success("Category extension requested");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[var(--border-grid)]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Town Index</span>
          </Link>

          <span className="font-mono text-xs text-[var(--ink-secondary)] uppercase">
            Community Contribution Studio
          </span>
        </div>

        {/* Page Title & Mission */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-wider text-[var(--accent-signal)] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Civic Governance</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[var(--ink-primary)] leading-[1.15] mb-3">
            Submit, Suggest & Expand
          </h1>
          <p className="text-[var(--ink-secondary)] text-sm sm:text-base max-w-2xl leading-relaxed">
            OneTownCity is maintained as a verified civic directory. Residents, student leaders, and business owners may suggest institutions, submit civic notices, or request category additions.
          </p>
        </div>

        {/* Moderation Pipeline Architecture Diagram */}
        <div className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-4">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-signal)]" />
            <span>Civic Moderation & Fact-Checking Lifecycle</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40 relative">
              <span className="font-mono text-[10px] font-bold text-[var(--accent-signal)] block mb-1">
                STAGE 01
              </span>
              <h3 className="font-mono text-xs font-semibold text-[var(--ink-primary)] mb-1 uppercase">
                Community Submission
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed font-sans">
                Submissions are logged into the database with <span className="font-mono text-[11px] font-semibold text-[var(--ink-primary)]">pending_review</span> status.
              </p>
            </div>

            <div className="p-4 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40 relative">
              <span className="font-mono text-[10px] font-bold text-[var(--ink-secondary)] block mb-1">
                STAGE 02
              </span>
              <h3 className="font-mono text-xs font-semibold text-[var(--ink-primary)] mb-1 uppercase">
                Admin Review & Verification
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed font-sans">
                City Admins inspect physical addresses, telephone contacts, and government source URLs.
              </p>
            </div>

            <div className="p-4 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40 relative">
              <span className="font-mono text-[10px] font-bold text-emerald-700 block mb-1">
                STAGE 03
              </span>
              <h3 className="font-mono text-xs font-semibold text-[var(--ink-primary)] mb-1 uppercase">
                Live Index Publication
              </h3>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed font-sans">
                Approved records receive verification badges and appear on the public discovery ledger.
              </p>
            </div>
          </div>
        </div>

        {/* Success Modal / Banner */}
        {successData ? (
          <div className="rounded-lg border-2 border-emerald-700/40 bg-emerald-950/10 p-8 text-center shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-800 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-medium text-emerald-950 mb-2">
              {successData.type} Submitted Successfully
            </h2>
            <p className="font-mono text-xs text-emerald-900 max-w-xl mx-auto leading-relaxed mb-6">
              {successData.message}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSuccessData(null);
                  setListingForm({
                    name: "",
                    vertical: "education",
                    city: "Nellore",
                    category_id: "",
                    address: "",
                    phone: "",
                    whatsapp: "",
                    website: "",
                    email: "",
                    description: "",
                  });
                }}
                className="px-5 py-2.5 rounded bg-[var(--ink-primary)] text-white font-mono text-xs font-semibold uppercase tracking-wider"
              >
                Submit Another Record
              </button>
              <Link
                href="/"
                className="px-5 py-2.5 rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] font-mono text-xs font-semibold uppercase tracking-wider text-[var(--ink-primary)] hover:border-[var(--ink-primary)]"
              >
                Return to Town Index
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] shadow-sm overflow-hidden">
            {/* 3-Tab Bar */}
            <div className="flex border-b border-[var(--border-grid)] bg-[var(--bg-muted)]/60 overflow-x-auto">
              <button
                onClick={() => setActiveTab("listing")}
                className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "listing"
                    ? "border-[var(--accent-signal)] text-[var(--ink-primary)] bg-[var(--bg-surface)]"
                    : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>01 / Suggest College or Business</span>
              </button>

              <button
                onClick={() => setActiveTab("news")}
                className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "news"
                    ? "border-[var(--accent-signal)] text-[var(--ink-primary)] bg-[var(--bg-surface)]"
                    : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>02 / Submit Event or Civic Notice</span>
              </button>

              <button
                onClick={() => setActiveTab("category")}
                className={`flex items-center gap-2 px-5 py-3.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "category"
                    ? "border-[var(--accent-signal)] text-[var(--ink-primary)] bg-[var(--bg-surface)]"
                    : "border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>03 / Request Category Extension</span>
              </button>
            </div>

            {/* TAB 01: SUGGEST LISTING */}
            {activeTab === "listing" && (
              <form onSubmit={handleListingSubmit} className="p-6 sm:p-8 space-y-6">
                <div className="p-4 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/30 text-xs text-[var(--ink-secondary)] font-mono leading-relaxed">
                  Strict Scope Enforced: Only Education Institutions (Colleges, Coaching, Schools) and Local Commercial Storefronts (Bookstores, Cafes, Retail) may be suggested. Handyman services, repair shops, and general real estate are strictly prohibited.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                      Vertical Category *
                    </label>
                    <select
                      value={listingForm.vertical}
                      onChange={(e) =>
                        setListingForm({
                          ...listingForm,
                          vertical: e.target.value as "education" | "business",
                          category_id: "",
                        })
                      }
                      className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-mono text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                    >
                      <option value="education">Education Hub (Colleges, Coaching, Schools)</option>
                      <option value="business">Local Business (Bookstores, Cafes, Retail)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                      Town / City *
                    </label>
                    <select
                      value={listingForm.city}
                      onChange={(e) => setListingForm({ ...listingForm, city: e.target.value })}
                      className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-mono text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                    >
                      <option value="Nellore">Nellore</option>
                      <option value="Kuppam">Kuppam</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                      Institution / Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priyadarshini College of Engineering"
                      value={listingForm.name}
                      onChange={(e) => setListingForm({ ...listingForm, name: e.target.value })}
                      className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-sans text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                      Subcategory Directory *
                    </label>
                    <select
                      value={listingForm.category_id}
                      onChange={(e) => setListingForm({ ...listingForm, category_id: e.target.value })}
                      className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-mono text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                    >
                      {filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                      Official Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 861 2345678"
                      value={listingForm.phone}
                      onChange={(e) => setListingForm({ ...listingForm, phone: e.target.value })}
                      className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-mono text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                      Official Website / Portal (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://narayana.edu.in"
                      value={listingForm.website}
                      onChange={(e) => setListingForm({ ...listingForm, website: e.target.value })}
                      className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-mono text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                    Physical Address & Locality *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Muthukur Road, Near Children's Park, Nellore"
                    value={listingForm.address}
                    onChange={(e) => setListingForm({ ...listingForm, address: e.target.value })}
                    className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-sans text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                    Institution Description & Key Offerings *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide overview, courses offered, library facilities, or services provided."
                    value={listingForm.description}
                    onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })}
                    className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-sans text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded bg-[var(--accent-signal)] text-white font-mono text-xs font-semibold uppercase tracking-wider hover:bg-[#e03f0b] transition-all disabled:opacity-50"
                >
                  {submitting ? "Submitting for Administrative Review..." : "Submit Listing Suggestion"}
                </button>
              </form>
            )}

            {/* TAB 02: SUBMIT NEWS / EVENT */}
            {activeTab === "news" && (
              <form onSubmit={handleNewsSubmit} className="p-6 sm:p-8 space-y-6">
                <div className="p-4 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/30 text-xs text-[var(--ink-secondary)] font-mono leading-relaxed">
                  Provable Fact Policy: All town announcements and civic updates require a verifiable source link (municipal gazette, university circular, or verified press release). Unsubstantiated rumors are rejected.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                      Update Type *
                    </label>
                    <select
                      value={newsForm.item_type}
                      onChange={(e) =>
                        setNewsForm({
                          ...newsForm,
                          item_type: e.target.value as "news" | "event" | "campus_notice" | "civic_development",
                        })
                      }
                      className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-mono text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                    >
                      <option value="news">Town News</option>
                      <option value="event">Local Event & Exhibition</option>
                      <option value="campus_notice">Campus Announcement</option>
                      <option value="civic_development">Civic Development Tracker</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                      Town / City *
                    </label>
                    <select
                      value={newsForm.city}
                      onChange={(e) => setNewsForm({ ...newsForm, city: e.target.value })}
                      className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-mono text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                    >
                      <option value="Nellore">Nellore</option>
                      <option value="Kuppam">Kuppam</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                    Headline / Update Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Municipal Flyover Phase 2 Completed Ahead of Schedule"
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-sans text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                      Official Source Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nellore Municipal Corporation Desk"
                      value={newsForm.source_name}
                      onChange={(e) => setNewsForm({ ...newsForm, source_name: e.target.value })}
                      className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-sans text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                      Verifiable Source URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://nellore.ap.gov.in/notices/..."
                      value={newsForm.source_url}
                      onChange={(e) => setNewsForm({ ...newsForm, source_url: e.target.value })}
                      className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-mono text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                    />
                  </div>
                </div>

                {newsForm.item_type === "event" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/20">
                    <div>
                      <label className="block font-mono text-xs uppercase text-[var(--ink-primary)] mb-1">
                        Event Date
                      </label>
                      <input
                        type="date"
                        value={newsForm.event_date}
                        onChange={(e) => setNewsForm({ ...newsForm, event_date: e.target.value })}
                        className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-2.5 py-1.5 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs uppercase text-[var(--ink-primary)] mb-1">
                        Event Time
                      </label>
                      <input
                        type="text"
                        placeholder="10:00 AM - 04:00 PM"
                        value={newsForm.event_time}
                        onChange={(e) => setNewsForm({ ...newsForm, event_time: e.target.value })}
                        className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-2.5 py-1.5 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs uppercase text-[var(--ink-primary)] mb-1">
                        Venue / Location
                      </label>
                      <input
                        type="text"
                        placeholder="Town Hall Auditorium"
                        value={newsForm.event_venue}
                        onChange={(e) => setNewsForm({ ...newsForm, event_venue: e.target.value })}
                        className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-2.5 py-1.5 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                    Update Content & Details *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Provide full details, facts, numbers, and impact on local residents or students."
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-sans text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded bg-[var(--accent-signal)] text-white font-mono text-xs font-semibold uppercase tracking-wider hover:bg-[#e03f0b] transition-all disabled:opacity-50"
                >
                  {submitting ? "Submitting for Editorial Verification..." : "Submit Town Update"}
                </button>
              </form>
            )}

            {/* TAB 03: CATEGORY EXTENSION */}
            {activeTab === "category" && (
              <form onSubmit={handleCategorySubmit} className="p-6 sm:p-8 space-y-6">
                <div className="p-4 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/30 text-xs text-[var(--ink-secondary)] font-mono leading-relaxed">
                  Taxonomy Rule: Any requested category must fall strictly under one of our 4 architectural pillars: News & Town Pulse, Education Hub, Student Corner, or Local Businesses.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                      Parent Vertical Pillar *
                    </label>
                    <select
                      value={categoryForm.vertical}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          vertical: e.target.value as "news" | "education" | "students" | "business",
                        })
                      }
                      className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-mono text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                    >
                      <option value="education">Education Hub</option>
                      <option value="business">Local Business</option>
                      <option value="students">Student Corner</option>
                      <option value="news">News & Town Pulse</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                      Proposed Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Polytechnic & Vocational Institutes"
                      value={categoryForm.proposed_name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, proposed_name: e.target.value })}
                      className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-sans text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                    Your Contributor Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="contributor@campus.local"
                    value={categoryForm.email}
                    onChange={(e) => setCategoryForm({ ...categoryForm, email: e.target.value })}
                    className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-mono text-xs text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1.5">
                    Justification & Local Community Benefit *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Explain why this subcategory is required in our town and list 2-3 local institutions or establishments that would be grouped under it."
                    value={categoryForm.justification}
                    onChange={(e) => setCategoryForm({ ...categoryForm, justification: e.target.value })}
                    className="w-full rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] px-3 py-2.5 font-sans text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-signal)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded bg-[var(--accent-signal)] text-white font-mono text-xs font-semibold uppercase tracking-wider hover:bg-[#e03f0b] transition-all disabled:opacity-50"
                >
                  {submitting ? "Submitting Request..." : "Submit Category Extension Request"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubmitStudioPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono text-xs">Loading Submission Studio...</div>}>
      <SubmitStudioContent />
    </Suspense>
  );
}
