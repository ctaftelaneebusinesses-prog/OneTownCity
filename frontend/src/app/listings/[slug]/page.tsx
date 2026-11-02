import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailClient, ListingDetail } from "./ListingDetailClient";

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getListing(slug: string): Promise<ListingDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/listings/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ListingDetail;
  } catch (err) {
    console.error(`Error fetching listing ${slug}:`, err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);

  if (!listing) {
    return {
      title: "Listing Not Found | OneTownCity",
      description: "The requested directory listing could not be found.",
    };
  }

  const verticalLabel = listing.vertical === "education" ? "Education Institution" : "Local Business";
  const title = `${listing.name} — Verified ${verticalLabel} in ${listing.locality}, ${listing.city}`;
  const description = listing.tagline || listing.description?.slice(0, 160) || `Verified dossier for ${listing.name} in ${listing.city}.`;
  const canonicalUrl = `${SITE_URL}/listings/${listing.slug}`;

  return {
    title: `${title} | OneTownCity`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "OneTownCity",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListing(slug);

  if (!listing) {
    notFound();
  }

  // Construct JSON-LD Schema (EducationalOrganization or LocalBusiness)
  const isEducation = listing.vertical === "education";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isEducation ? "EducationalOrganization" : "LocalBusiness",
    name: listing.name,
    description: listing.tagline || listing.description,
    url: `${SITE_URL}/listings/${listing.slug}`,
    telephone: listing.phone || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.locality,
      addressRegion: listing.city,
      addressCountry: "IN",
    },
    ...(isEducation && listing.courses?.length > 0
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Academic Courses & Programs",
            itemListElement: listing.courses.map((course) => ({
              "@type": "Course",
              name: course.name,
              description: `Duration: ${course.duration}. Fee Est: ${course.fee_est}`,
            })),
          },
        }
      : {}),
    ...(listing.operating_hours && Object.keys(listing.operating_hours).length > 0
      ? {
          openingHours: Object.entries(listing.operating_hours).map(
            ([day, hrs]) => `${day.slice(0, 2).toUpperCase()} ${hrs}`
          ),
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ListingDetailClient listing={listing} />
    </>
  );
}
