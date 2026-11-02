"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { EnquiryModal } from "@/components/EnquiryModal";
import { ReportModal } from "@/components/ReportModal";
import { getCoverImage, getMonogram } from "@/lib/covers";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Globe,
  MapPin,
  GraduationCap,
  Building,
  Flag,
  Send,
  ShieldCheck,
  Tag,
  Share2,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

export type CourseItem = {
  name: string;
  duration: string;
  fee_est: string;
  intake: number;
};

export type AdmissionsData = {
  status?: string;
  academic_year?: string;
  deadline?: string;
  entrance_exams?: string[];
};

export type ListingDetail = {
  id: string;
  tenant_id: string;
  vertical: "education" | "business" | "news" | "students";
  slug: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  locality: string;
  city: string;
  phone: string;
  whatsapp: string;
  website: string;
  email: string;
  operating_hours: Record<string, string>;
  facilities: string[];
  courses: CourseItem[];
  admissions: AdmissionsData;
  is_sponsored: boolean;
  verification_status: "not_verified" | "owner_claimed" | "details_reviewed";
  view_count: number;
  whatsapp_clicks: number;
  last_confirmed_at: string;
};

interface ListingDetailClientProps {
  listing: ListingDetail;
}

export function ListingDetailClient({ listing }: ListingDetailClientProps) {
  const router = useRouter();
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const coverUrl = getCoverImage(listing.vertical, listing.name);
  const monogram = getMonogram(listing.name);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleTelemetryClick = async (type: "whatsapp" | "call") => {
    try {
      await fetch(`${API_BASE}/telemetry/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listing.id, click_type: type }),
      });
    } catch {
      // Telemetry should not block user interaction
    }
  };

  return (
    <div style={{ backgroundColor: "#F4F2EE", minHeight: "100vh" }} className="pb-16">
      {/* Visual Cover Banner */}
      <div className="relative min-h-[300px] sm:h-80 w-full overflow-hidden bg-[#111110]">
        <Image
          src={coverUrl}
          alt={listing.name}
          fill
          unoptimized={coverUrl.endsWith(".svg")}
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111110]/95 via-[#111110]/40 to-transparent" />

        {/* Top bar over cover */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-md px-3 py-1.5 font-mono text-xs text-white uppercase hover:bg-black/80 transition-colors pressable border border-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Directory Index</span>
          </Link>

          <div className="flex items-center gap-2">
            {listing.verification_status === "details_reviewed" && (
              <span className="inline-flex items-center gap-1 rounded bg-[#0D6847] px-2.5 py-1 font-mono text-[10px] font-bold text-white uppercase shadow-sm">
                <CheckCircle2 className="h-3 w-3" />
                DETAILS REVIEWED
              </span>
            )}
            {listing.verification_status === "owner_claimed" && (
              <span className="inline-flex items-center gap-1 rounded bg-[#111110] px-2.5 py-1 font-mono text-[10px] font-bold text-white uppercase border border-[#D8D3C8]/40 shadow-sm">
                <ShieldCheck className="h-3 w-3 text-[#FF4F17]" />
                OWNER CLAIMED
              </span>
            )}
            {listing.is_sponsored && (
              <span className="inline-flex items-center gap-1 rounded bg-[#D97706] px-2.5 py-1 font-mono text-[10px] font-bold text-white uppercase shadow-sm">
                <Tag className="h-3 w-3" />
                SPONSORED
              </span>
            )}
          </div>
        </div>

        {/* Bottom Banner Identity Info */}
        <div className="absolute bottom-6 left-6 right-6 max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white border-2 border-[#D8D3C8] shadow-lg flex items-center justify-center font-mono text-xl sm:text-2xl font-black text-[#111110] shrink-0">
              {monogram}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs uppercase tracking-wider text-[#FF4F17] font-bold bg-[#111110]/80 px-2 py-0.5 rounded backdrop-blur-sm">
                  {listing.vertical === "education" ? "Education Hub" : "Verified Business"}
                </span>
                <span className="font-mono text-xs text-white/70 uppercase">
                  {listing.locality}, {listing.city}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl text-white font-normal tracking-tight">
                {listing.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-2 font-mono text-xs text-white uppercase transition-colors pressable border border-white/20"
              title="Copy share link"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copiedShare ? "Copied" : "Share"}</span>
            </button>
            <button
              onClick={() => setIsEnquiryOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF4F17] hover:bg-[#e04310] px-4 py-2 font-mono text-xs font-bold text-white uppercase transition-colors pressable shadow-md"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Direct Enquiry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols) — Dossier Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tagline & Description Card */}
            <div className="rounded-2xl border border-[#D8D3C8] bg-white p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#D8D3C8] pb-4">
                <span className="font-mono text-xs uppercase font-bold text-[#575551]">
                  Dossier Overview
                </span>
                <span className="font-mono text-xs text-[#8B877F] tabular-nums">
                  Last Confirmed: {listing.last_confirmed_at?.slice(0, 10) || "Recent"}
                </span>
              </div>
              {listing.tagline && (
                <p className="font-sans text-lg font-medium text-[#111110]">
                  {listing.tagline}
                </p>
              )}
              <p className="font-sans text-sm text-[#575551] leading-relaxed">
                {listing.description || "Official institution profile registered in OneTownCity hyperlocal network."}
              </p>
            </div>

            {/* Courses / Programs Section (Education Hub) */}
            {listing.vertical === "education" && listing.courses && listing.courses.length > 0 && (
              <div className="rounded-2xl border border-[#D8D3C8] bg-white p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#D8D3C8] pb-4">
                  <GraduationCap className="h-4 w-4 text-[#FF4F17]" />
                  <span className="font-mono text-xs uppercase font-bold text-[#111110]">
                    Offered Courses & Admissions Intake
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {listing.courses.map((course, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-[#D8D3C8] bg-[#F4F2EE]/50 p-3.5 space-y-1 hover:border-[#111110] transition-colors"
                    >
                      <p className="font-sans text-sm font-bold text-[#111110]">{course.name}</p>
                      <div className="flex items-center justify-between font-mono text-xs text-[#575551]">
                        <span>{course.duration}</span>
                        <span className="text-[#0D6847] font-bold">{course.fee_est}</span>
                      </div>
                      {course.intake > 0 && (
                        <p className="font-mono text-[11px] text-[#8B877F]">Intake: {course.intake} seats</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities Metadata */}
            {listing.facilities && listing.facilities.length > 0 && (
              <div className="rounded-2xl border border-[#D8D3C8] bg-white p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#D8D3C8] pb-4">
                  <Building className="h-4 w-4 text-[#FF4F17]" />
                  <span className="font-mono text-xs uppercase font-bold text-[#111110]">
                    Verified Campus & Facility Amenities
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {listing.facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-[#D8D3C8] bg-[#F4F2EE] px-3 py-1.5 font-mono text-xs text-[#111110] uppercase"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (1 Col) — Contact, Hours & Action Card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#D8D3C8] bg-white p-6 space-y-6 shadow-sm sticky top-24">
              <span className="font-mono text-xs uppercase font-bold text-[#575551] block border-b border-[#D8D3C8] pb-3">
                Direct Contact Actions
              </span>

              {/* Physical Address */}
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#575551] shrink-0 mt-0.5" />
                <div className="font-mono text-xs text-[#575551] leading-relaxed">
                  <p className="font-bold text-[#111110]">{listing.locality}</p>
                  <p>{listing.address}</p>
                  <p>{listing.city}</p>
                </div>
              </div>

              {/* Primary Contact Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setIsEnquiryOpen(true)}
                  className="w-full rounded-xl bg-[#FF4F17] hover:bg-[#e04310] text-white font-mono text-xs font-bold uppercase py-3 flex items-center justify-center gap-2 transition-colors pressable shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Direct Enquiry</span>
                </button>

                {listing.whatsapp && (
                  <a
                    href={`https://wa.me/${listing.whatsapp.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(listing.name)},%20I%20found%20your%20verified%20profile%20on%20OneTownCity.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleTelemetryClick("whatsapp")}
                    className="w-full rounded-xl border border-[#0D6847] bg-[#0D6847]/10 hover:bg-[#0D6847]/20 text-[#0D6847] font-mono text-xs font-bold uppercase py-2.5 flex items-center justify-center gap-2 transition-colors pressable"
                  >
                    <MessageSquare className="h-4 w-4 text-[#0D6847]" />
                    <span>WhatsApp Verified Desk</span>
                  </a>
                )}

                {listing.phone && (
                  <a
                    href={`tel:${listing.phone}`}
                    onClick={() => handleTelemetryClick("call")}
                    className="w-full rounded-xl border border-[#D8D3C8] hover:border-[#111110] bg-white text-[#111110] font-mono text-xs font-bold uppercase py-2.5 flex items-center justify-center gap-2 transition-colors pressable"
                  >
                    <Phone className="h-4 w-4 text-[#111110]" />
                    <span>Call Helpline: {listing.phone}</span>
                  </a>
                )}
              </div>

              {/* Operating Hours */}
              {listing.operating_hours && Object.keys(listing.operating_hours).length > 0 && (
                <div className="border-t border-[#D8D3C8] pt-4 space-y-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#111110] uppercase">
                    <Clock className="h-3.5 w-3.5 text-[#FF4F17]" />
                    <span>Operating Hours</span>
                  </div>
                  <div className="space-y-1 font-mono text-xs text-[#575551]">
                    {Object.entries(listing.operating_hours).map(([day, hrs]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize">{day}</span>
                        <span className="text-[#111110] font-medium">{hrs}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citizen Reporting Action */}
              <div className="border-t border-[#D8D3C8] pt-4 flex items-center justify-between font-mono text-xs">
                <span className="text-[#8B877F]">Notice inaccurate info?</span>
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="text-[#FF4F17] hover:underline font-bold uppercase flex items-center gap-1"
                >
                  <Flag className="h-3 w-3" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        listing={listing}
        apiUrl={API_BASE}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        listing={listing}
        apiUrl={API_BASE}
      />
    </div>
  );
}
