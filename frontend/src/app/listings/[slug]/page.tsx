"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { EnquiryModal } from "@/components/EnquiryModal";
import { ReportModal } from "@/components/ReportModal";
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
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

type CourseItem = {
  name: string;
  duration: string;
  fee_est: string;
  intake: number;
};

type AdmissionsData = {
  status?: string;
  academic_year?: string;
  deadline?: string;
  entrance_exams?: string[];
};

type ListingDetail = {
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

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    fetch(`${API_BASE}/listings/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Listing not found");
        return res.json();
      })
      .then((data) => setListing(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const recordClick = async (type: "whatsapp" | "call") => {
    if (!listing) return;
    try {
      await fetch(`${API_BASE}/telemetry/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listing.id, click_type: type }),
      });
    } catch (e) {
      console.error("Telemetry error:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center font-mono text-xs text-neutral-400 uppercase">
        Loading verified profile details...
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h2 className="font-mono text-base font-bold text-neutral-100 uppercase">
          Listing Profile Not Found
        </h2>
        <p className="mt-2 font-mono text-xs text-neutral-400">
          The requested profile may have been removed or updated.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 inline-flex items-center gap-1.5 rounded bg-neutral-100 px-4 py-2 font-mono text-xs font-bold text-neutral-950 uppercase"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Discovery</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-400 hover:text-white uppercase transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Directory</span>
        </Link>
        <span className="font-mono text-xs text-neutral-500 uppercase">
          Canonical ID: {listing.slug}
        </span>
      </div>

      {/* Header Profile Block */}
      <div className="rounded border border-neutral-800 bg-neutral-900/40 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-neutral-800 px-2.5 py-1 font-mono text-xs font-semibold text-neutral-200 uppercase">
              {listing.vertical === "education" ? "Education Institution" : "Commercial Business"}
            </span>

            {listing.verification_status === "details_reviewed" && (
              <span className="inline-flex items-center gap-1 rounded border border-neutral-600 bg-neutral-800 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Details Reviewed
              </span>
            )}
            {listing.verification_status === "owner_claimed" && (
              <span className="rounded border border-neutral-700 bg-neutral-900 px-2 py-0.5 font-mono text-[10px] text-neutral-300 uppercase">
                Owner Claimed
              </span>
            )}
            {listing.is_sponsored && (
              <span className="rounded border border-amber-600/50 bg-amber-950/30 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-200 uppercase">
                Sponsored Partner
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReportOpen(true)}
              className="inline-flex items-center gap-1 rounded border border-neutral-800 px-2.5 py-1 font-mono text-[10px] text-neutral-400 hover:bg-neutral-900 hover:text-white uppercase"
            >
              <Flag className="h-3 w-3" />
              <span>Report Details</span>
            </button>
            <span className="font-mono text-[10px] text-neutral-500 font-mono-numbers">
              Confirmed: {new Date(listing.last_confirmed_at).toISOString().split("T")[0]}
            </span>
          </div>
        </div>

        <h1 className="mt-4 font-mono text-2xl font-bold uppercase tracking-tight text-neutral-100 sm:text-3xl">
          {listing.name}
        </h1>
        <p className="mt-1 font-sans text-sm text-neutral-300">{listing.tagline}</p>

        {/* Address and Contact Row */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-neutral-800 font-mono text-xs text-neutral-400">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
            <span>
              {listing.address}, {listing.locality}, {listing.city}
            </span>
          </div>

          <div className="flex flex-col gap-1 sm:items-end">
            {listing.phone && <span>Phone: {listing.phone}</span>}
            {listing.website && (
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-neutral-200 underline hover:text-white"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Official Web Portal</span>
              </a>
            )}
          </div>
        </div>

        {/* Primary Action Row */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-neutral-800 pt-5">
          <button
            onClick={() => setIsEnquiryOpen(true)}
            className="inline-flex items-center gap-2 rounded bg-neutral-100 px-5 py-2.5 font-mono text-xs font-bold uppercase text-neutral-950 hover:bg-white"
          >
            <Send className="h-4 w-4" />
            <span>{listing.vertical === "education" ? "Direct Admission / Course Enquiry" : "Send Enquiry"}</span>
          </button>

          {listing.whatsapp && (
            <a
              href={`https://wa.me/${listing.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordClick("whatsapp")}
              className="inline-flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 px-4 py-2.5 font-mono text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp Message</span>
            </a>
          )}

          {listing.phone && (
            <a
              href={`tel:${listing.phone}`}
              onClick={() => recordClick("call")}
              className="inline-flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 px-4 py-2.5 font-mono text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white"
            >
              <Phone className="h-4 w-4" />
              <span>Call Campus Desk</span>
            </a>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="mt-8 rounded border border-neutral-800 bg-neutral-900/20 p-6">
        <h2 className="font-mono text-sm font-bold uppercase text-neutral-200 tracking-wider">
          Profile Overview
        </h2>
        <p className="mt-3 font-sans text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
          {listing.description}
        </p>
      </div>

      {/* Education Specifics: Course Catalog & Admissions */}
      {listing.vertical === "education" && (
        <div className="mt-8 space-y-6">
          {/* Admissions Timeline Box */}
          {listing.admissions && (
            <div className="rounded border border-neutral-800 bg-neutral-900/30 p-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-neutral-300" />
                <h3 className="font-mono text-sm font-bold uppercase text-neutral-100">
                  Admissions Status & Entrance Criteria
                </h3>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="rounded bg-neutral-900 p-3 border border-neutral-800">
                  <span className="text-neutral-500 uppercase block text-[10px]">Current Status</span>
                  <span className="font-bold text-white uppercase mt-1 block">
                    {listing.admissions.status || "Open for Enrollment"}
                  </span>
                </div>
                <div className="rounded bg-neutral-900 p-3 border border-neutral-800">
                  <span className="text-neutral-500 uppercase block text-[10px]">Academic Year</span>
                  <span className="font-bold text-white uppercase mt-1 block">
                    {listing.admissions.academic_year || "2026-2027"}
                  </span>
                </div>
                <div className="rounded bg-neutral-900 p-3 border border-neutral-800">
                  <span className="text-neutral-500 uppercase block text-[10px]">Application Deadline</span>
                  <span className="font-bold text-white uppercase mt-1 block font-mono-numbers">
                    {listing.admissions.deadline || "Rolling Admissions"}
                  </span>
                </div>
              </div>

              {listing.admissions.entrance_exams && (
                <div className="mt-3 font-mono text-xs text-neutral-400">
                  Accepted Entrance Evaluations:{" "}
                  <strong className="text-neutral-200">
                    {listing.admissions.entrance_exams.join(", ")}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Courses & Fee Structure Catalog */}
          {listing.courses && listing.courses.length > 0 && (
            <div className="rounded border border-neutral-800 bg-neutral-900/30 p-6">
              <h3 className="font-mono text-sm font-bold uppercase text-neutral-100 tracking-wider mb-4">
                Structured Course Catalog & Fee Estimates
              </h3>
              <div className="divide-y divide-neutral-800 font-mono text-xs">
                {listing.courses.map((course, idx) => (
                  <div key={idx} className="py-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-neutral-100 uppercase">{course.name}</div>
                      <div className="text-[11px] text-neutral-500">Duration: {course.duration} | Approved Seats: {course.intake}</div>
                    </div>
                    <div className="text-right">
                      <span className="rounded bg-neutral-800 px-2.5 py-1 text-white font-mono-numbers font-semibold">
                        {course.fee_est}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Facilities & Amenities */}
      {listing.facilities && listing.facilities.length > 0 && (
        <div className="mt-8 rounded border border-neutral-800 bg-neutral-900/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-4 w-4 text-neutral-400" />
            <h3 className="font-mono text-sm font-bold uppercase text-neutral-200">
              Campus Facilities & Infrastructure
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {listing.facilities.map((fac, idx) => (
              <span
                key={idx}
                className="rounded border border-neutral-800 bg-neutral-900 px-3 py-1 font-mono text-xs text-neutral-300 uppercase"
              >
                {fac}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Business Operating Hours */}
      {listing.vertical === "business" && listing.operating_hours && (
        <div className="mt-8 rounded border border-neutral-800 bg-neutral-900/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-neutral-400" />
            <h3 className="font-mono text-sm font-bold uppercase text-neutral-200">
              Verified Operating Hours
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
            {Object.entries(listing.operating_hours).map(([day, hrs]) => (
              <div key={day} className="flex justify-between border-b border-neutral-800/60 py-1.5">
                <span className="text-neutral-400 uppercase">{day.replace(/_/g, " ")}:</span>
                <span className="font-semibold text-white">{hrs}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        listing={listing}
        apiUrl={API_BASE}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        listing={listing}
        apiUrl={API_BASE}
      />
    </div>
  );
}
