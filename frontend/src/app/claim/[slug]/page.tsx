import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClaimClient, ListingSummary } from "./ClaimClient";

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getListing(slug: string): Promise<ListingSummary | null> {
  try {
    const res = await fetch(`${API_BASE}/listings/${slug}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ListingSummary;
  } catch (err) {
    console.error(`Error fetching listing for claim ${slug}:`, err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);

  if (!listing) {
    return {
      title: "Profile Not Found | OneTownCity",
      description: "Target directory listing could not be found.",
    };
  }

  return {
    title: `Claim ${listing.name} Profile — Verification Portal | OneTownCity`,
    description: `Official ownership verification portal for ${listing.name} in ${listing.city}.`,
  };
}

export default async function ClaimPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListing(slug);

  if (!listing) {
    notFound();
  }

  return <ClaimClient listing={listing} />;
}
