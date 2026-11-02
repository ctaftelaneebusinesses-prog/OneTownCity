"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Share2,
  Flag,
  FileText,
  Sparkles,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { ReportModal } from "@/components/ReportModal";

export type TownNews = {
  id: string;
  tenant_id: string | null;
  city: string;
  locality: string;
  item_type: "news" | "event" | "campus_notice" | "civic_development";
  title: string;
  slug: string;
  content: string;
  source_name: string;
  source_url: string;
  is_confirmed_fact: boolean;
  event_date: string | null;
  event_time: string | null;
  event_venue: string | null;
  moderation_status: string;
  created_at: string;
  updated_at: string;
};

interface NewsDetailClientProps {
  news: TownNews;
  relatedNews: TownNews[];
}

export function NewsDetailClient({ news, relatedNews }: NewsDetailClientProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Shareable link copied to clipboard");
    } catch {
      toast.error("Unable to copy link to clipboard");
    }
  };

  const formattedUpdated = new Date(news.updated_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedEventDate = news.event_date
    ? new Date(news.event_date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const itemTypeLabels: Record<string, string> = {
    news: "Town News",
    event: "Local Event",
    campus_notice: "Campus Notice",
    civic_development: "Civic Development",
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[var(--border-grid)]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Town Index</span>
          </Link>

          <button
            onClick={handleCopyShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] font-mono text-xs text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:border-[var(--ink-primary)] transition-all"
            title="Share this update"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share Update</span>
          </button>
        </div>

        {/* Editorial Masthead */}
        <article className="rounded-lg border border-[var(--border-grid)] bg-[var(--bg-surface)] p-6 sm:p-8 mb-8 shadow-sm">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded border border-[var(--border-grid)] bg-[var(--bg-muted)] text-[var(--ink-primary)]">
              {itemTypeLabels[news.item_type] || news.item_type}
            </span>

            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded border border-[var(--border-grid)] text-[var(--ink-secondary)]">
              {news.city} {news.locality ? `• ${news.locality}` : ""}
            </span>

            {/* Confirmed Fact vs Proposal Status */}
            {news.is_confirmed_fact ? (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded border border-emerald-700/30 bg-emerald-950/10 text-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>Confirmed Fact</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded border border-amber-700/30 bg-amber-950/10 text-amber-800">
                <AlertCircle className="w-3 h-3 text-amber-700" />
                <span>Proposal / Under Review</span>
              </span>
            )}

            <span className="ml-auto font-mono text-[11px] text-[var(--ink-secondary)]">
              Updated: {formattedUpdated}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[var(--ink-primary)] leading-[1.15] mb-6">
            {news.title}
          </h1>

          {/* Event Logistics Card (if event details present) */}
          {(formattedEventDate || news.event_time || news.event_venue) && (
            <div className="rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/60 p-5 mb-8">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-signal)]" />
                <span>Event Logistics & Scheduling</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                {formattedEventDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-[var(--accent-signal)] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[var(--ink-secondary)] block text-[10px] uppercase">Date</span>
                      <span className="font-semibold text-[var(--ink-primary)]">{formattedEventDate}</span>
                    </div>
                  </div>
                )}
                {news.event_time && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[var(--accent-signal)] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[var(--ink-secondary)] block text-[10px] uppercase">Time</span>
                      <span className="font-semibold text-[var(--ink-primary)]">{news.event_time}</span>
                    </div>
                  </div>
                )}
                {news.event_venue && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[var(--accent-signal)] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[var(--ink-secondary)] block text-[10px] uppercase">Venue</span>
                      <span className="font-semibold text-[var(--ink-primary)]">{news.event_venue}</span>
                    </div>
                  </div>
                )}
              </div>

              {news.event_venue && (
                <div className="mt-4 pt-3 border-t border-[var(--border-grid)]/60 flex items-center justify-between">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${news.event_venue}, ${news.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--accent-signal)] hover:underline"
                  >
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={handleCopyShare}
                    className="font-mono text-xs text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
                  >
                    Copy Event Link
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Main Editorial Content */}
          <div className="prose prose-neutral max-w-none text-[var(--ink-primary)] text-base sm:text-lg leading-relaxed whitespace-pre-line mb-8 font-sans">
            {news.content}
          </div>

          {/* Source Verification Ledger Box */}
          <div className="rounded border border-[var(--border-grid)] bg-[var(--bg-muted)]/40 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider font-semibold text-[var(--ink-primary)] mb-1">
                  <FileText className="w-3.5 h-3.5 text-[var(--ink-secondary)]" />
                  <span>Source Verification Ledger</span>
                </div>
                <p className="font-mono text-xs text-[var(--ink-secondary)]">
                  Reported by: <span className="font-semibold text-[var(--ink-primary)]">{news.source_name}</span>
                </p>
                {news.source_url && (
                  <a
                    href={news.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-[var(--accent-signal)] hover:underline mt-1 break-all"
                  >
                    <span>Official Source Document</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
              </div>

              <button
                onClick={() => setIsReportOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] font-mono text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--accent-signal)] hover:border-[var(--accent-signal)] transition-colors shrink-0"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Flag Outdated / Submit Correction</span>
              </button>
            </div>
          </div>
        </article>

        {/* Related Town Updates */}
        {relatedNews.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 bg-[var(--accent-signal)] rounded-full" />
              <h2 className="font-serif text-2xl font-medium text-[var(--ink-primary)]">
                More Updates from {news.city}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="group block rounded border border-[var(--border-grid)] bg-[var(--bg-surface)] p-5 hover:border-[var(--ink-primary)] transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-secondary)] mb-2">
                    <span>{itemTypeLabels[item.item_type] || item.item_type}</span>
                    <span>•</span>
                    <span>{new Date(item.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                    {item.is_confirmed_fact && (
                      <span className="ml-auto text-emerald-800 font-semibold">Confirmed</span>
                    )}
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[var(--ink-primary)] group-hover:text-[var(--accent-signal)] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        listing={{ id: news.id, name: news.title }}
      />
    </div>
  );
}
