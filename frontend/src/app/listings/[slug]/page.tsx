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
  ShieldCheck,
  Tag,
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
      <div className="min-h-screen bg-[#DDE3E8] py-16 text-center font-mono text-xs text-[#5E4B5B] uppercase">
        Loading verified profile details...
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#DDE3E8] py-16 text-center px-4">
        <h2 className="font-mono text-base font-bold text-[#3A0F34] uppercase">
          Listing Profile Not Found
        </h2>
        <p className="mt-2 font-mono text-xs text-[#5E4B5B]">
          The requested profile may have been removed or updated.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 inline-flex items-center gap-1.5 rounded bg-[#3A0F34] px-4 py-2 font-mono text-xs font-bold text-[#F8FAFC] uppercase hover:bg-[#240820] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          <span>Back to Discovery</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#DDE3E8] py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between border-b border-[#C3CDD6] pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#3A0F34] hover:text-[#EAAA00] uppercase transition-colors"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            <span>Back to Directory</span>
          </Link>
          <span className="font-mono text-xs text-[#5E4B5B] uppercase">
            Canonical ID: {listing.slug}
          </span>
        </div>

        {/* Header Profile Block */}
        <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#DDE3E8] border border-[#C3CDD6] px-2.5 py-1 font-mono text-xs font-bold text-[#1E081B] uppercase">
                {listing.vertical === "education" ? "Education Institution" : "Commercial Business"}
              </span>

              {listing.verification_status === "details_reviewed" && (
                <span className="inline-flex items-center gap-1 rounded bg-[#0D6E52] px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase shadow-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                  Details Reviewed
                </span>
              )}
              {listing.verification_status === "owner_claimed" && (
                <span className="inline-flex items-center gap-1 rounded bg-[#3A0F34] px-2 py-0.5 font-mono text-[10px] font-bold text-[#F8FAFC] uppercase">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#EAAA00]" strokeWidth={2} />
                  Owner Claimed
                </span>
              )}
              {listing.is_sponsored && (
                <span className="rounded bg-[#EAAA00] px-2 py-0.5 font-mono text-[10px] font-extrabold text-[#240820] uppercase shadow-xs">
                  Sponsored Partner
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsReportOpen(true)}
                className="inline-flex items-center gap-1 rounded border border-[#C3CDD6] bg-[#DDE3E8] px-2.5 py-1 font-mono text-[10px] font-semibold text-[#5E4B5B] hover:text-[#B93829] hover:border-[#B93829] uppercase transition-colors"
              >
                <Flag className="h-3 w-3" strokeWidth={1.75} />
                <span>Report Details</span>
              </button>
              <span className="font-mono text-[10px] text-[#5E4B5B] font-mono-numbers">
                Confirmed: {new Date(listing.last_confirmed_at).toISOString().split("T")[0]}
              </span>
            </div>
          </div>

          <h1 className="mt-4 font-mono text-2xl font-bold uppercase tracking-tight text-[#3A0F34] sm:text-3xl">
            {listing.name}
          </h1>
          <p className="mt-1 font-sans text-sm text-[#5E4B5B]">{listing.tagline}</p>

          {/* Student/Local Active Benefit Callout */}
          <div className="mt-4 flex items-center justify-between rounded-r bg-[#EAAA00]/15 border-l-4 border-[#EAAA00] px-3.5 py-2">
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-[#3A0F34]" strokeWidth={2} />
              <span className="font-mono text-xs font-bold text-[#1E081B] uppercase tracking-wide">
                {listing.vertical === "education" ? "Verified Enrollment & Course Admissions Open" : "Direct Local Availability & Offers Active"}
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-[#0D6E52]">
              SaaS Enforced Lead Response
            </span>
          </div>

          {/* Address and Contact Row */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#C3CDD6] font-mono text-xs text-[#5E4B5B]">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[#3A0F34] shrink-0 mt-0.5" strokeWidth={1.75} />
              <span className="text-[#1E081B]">
                {listing.address}, {listing.locality}, {listing.city}
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:items-end">
              {listing.phone && <span>Phone: <strong className="text-[#1E081B]">{listing.phone}</strong></span>}
              {listing.website && (
                <a
                  href={listing.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#3A0F34] underline hover:text-[#EAAA00]"
                >
                  <Globe className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Official Web Portal</span>
                </a>
              )}
            </div>
          </div>

          {/* Primary Action Row */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#C3CDD6] pt-5">
            <button
              onClick={() => setIsEnquiryOpen(true)}
              className="inline-flex items-center gap-2 rounded bg-[#3A0F34] px-5 py-2.5 font-mono text-xs font-bold uppercase text-[#F8FAFC] hover:bg-[#240820] shadow transition-colors"
            >
              <Send className="h-4 w-4" strokeWidth={1.75} />
              <span>{listing.vertical === "education" ? "Direct Admission / Course Enquiry" : "Send Enquiry"}</span>
            </button>

            {listing.whatsapp && (
              <a
                href={`https://wa.me/${listing.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordClick("whatsapp")}
                className="inline-flex items-center gap-2 rounded border border-[#C3CDD6] bg-[#DDE3E8] px-4 py-2.5 font-mono text-xs font-bold text-[#1E081B] hover:bg-[#3A0F34] hover:text-[#F8FAFC] transition-colors"
              >
                <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
                <span>WhatsApp Message</span>
              </a>
            )}

            {listing.phone && (
              <a
                href={`tel:${listing.phone}`}
                onClick={() => recordClick("call")}
                className="inline-flex items-center gap-2 rounded border border-[#C3CDD6] bg-[#DDE3E8] px-4 py-2.5 font-mono text-xs font-bold text-[#1E081B] hover:bg-[#3A0F34] hover:text-[#F8FAFC] transition-colors"
              >
                <Phone className="h-4 w-4" strokeWidth={1.75} />
                <span>Call Campus Desk</span>
              </a>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-8 rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#C3CDD6] pb-3 mb-4">
            <div className="h-4 w-1 bg-[#3A0F34] rounded-xs" />
            <h2 className="font-mono text-sm font-bold uppercase text-[#3A0F34] tracking-wider">
              Profile Overview
            </h2>
          </div>
          <p className="font-sans text-xs sm:text-sm text-[#1E081B]/85 leading-relaxed whitespace-pre-line">
            {listing.description}
          </p>
        </div>

        {/* Education Specifics: Course Catalog & Admissions */}
        {listing.vertical === "education" && (
          <div className="mt-8 space-y-6">
            {/* Admissions Timeline Box */}
            {listing.admissions && (
              <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#C3CDD6] pb-3 mb-4">
                  <GraduationCap className="h-4 w-4 text-[#3A0F34]" strokeWidth={1.75} />
                  <h3 className="font-mono text-sm font-bold uppercase text-[#3A0F34] tracking-wider">
                    Admissions Status & Entrance Criteria
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="rounded bg-[#DDE3E8]/60 p-3.5 border border-[#C3CDD6]">
                    <span className="text-[#5E4B5B] uppercase block text-[10px] font-bold">Current Status</span>
                    <span className="font-bold text-[#0D6E52] uppercase mt-1 block">
                      {listing.admissions.status || "Open for Enrollment"}
                    </span>
                  </div>
                  <div className="rounded bg-[#DDE3E8]/60 p-3.5 border border-[#C3CDD6]">
                    <span className="text-[#5E4B5B] uppercase block text-[10px] font-bold">Academic Year</span>
                    <span className="font-bold text-[#1E081B] uppercase mt-1 block font-mono-numbers">
                      {listing.admissions.academic_year || "2026-2027"}
                    </span>
                  </div>
                  <div className="rounded bg-[#DDE3E8]/60 p-3.5 border border-[#C3CDD6]">
                    <span className="text-[#5E4B5B] uppercase block text-[10px] font-bold">Application Deadline</span>
                    <span className="font-bold text-[#3A0F34] uppercase mt-1 block font-mono-numbers">
                      {listing.admissions.deadline || "Rolling Admissions"}
                    </span>
                  </div>
                </div>

                {listing.admissions.entrance_exams && (
                  <div className="mt-3.5 font-mono text-xs text-[#5E4B5B]">
                    Accepted Entrance Evaluations:{" "}
                    <strong className="text-[#1E081B]">
                      {listing.admissions.entrance_exams.join(", ")}
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* Courses & Fee Structure Catalog */}
            {listing.courses && listing.courses.length > 0 && (
              <div className="rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#C3CDD6] pb-3 mb-4">
                  <div className="h-4 w-1 bg-[#3A0F34] rounded-xs" />
                  <h3 className="font-mono text-sm font-bold uppercase text-[#3A0F34] tracking-wider">
                    Structured Course Catalog & Fee Estimates
                  </h3>
                </div>
                <div className="divide-y divide-[#C3CDD6] font-mono text-xs">
                  {listing.courses.map((course, idx) => (
                    <div key={idx} className="py-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-[#1E081B] uppercase">{course.name}</div>
                        <div className="text-[11px] text-[#5E4B5B]">Duration: {course.duration} | Approved Seats: {course.intake}</div>
                      </div>
                      <div className="text-right">
                        <span className="rounded bg-[#3A0F34] px-2.5 py-1 text-[#F8FAFC] font-mono-numbers font-bold shadow-xs">
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
          <div className="mt-8 rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-[#C3CDD6] pb-3">
              <Building className="h-4 w-4 text-[#3A0F34]" strokeWidth={1.75} />
              <h3 className="font-mono text-sm font-bold uppercase text-[#3A0F34] tracking-wider">
                Campus Facilities & Infrastructure
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {listing.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="rounded border border-[#C3CDD6] bg-[#DDE3E8] px-3 py-1 font-mono text-xs font-semibold text-[#1E081B] uppercase"
                >
                  {fac}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Business Operating Hours */}
        {listing.vertical === "business" && listing.operating_hours && (
          <div className="mt-8 rounded-lg border border-[#C3CDD6] bg-[#F8FAFC] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-[#C3CDD6] pb-3">
              <Clock className="h-4 w-4 text-[#3A0F34]" strokeWidth={1.75} />
              <h3 className="font-mono text-sm font-bold uppercase text-[#3A0F34] tracking-wider">
                Verified Operating Hours
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              {Object.entries(listing.operating_hours).map(([day, hrs]) => (
                <div key={day} className="flex justify-between border-b border-[#C3CDD6]/60 py-1.5">
                  <span className="text-[#5E4B5B] uppercase">{day.replace(/_/g, " ")}:</span>
                  <span className="font-bold text-[#1E081B]">{hrs}</span>
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
    </div>
  );
}
