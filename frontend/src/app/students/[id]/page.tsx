import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  StudentOpportunityClient,
  StudentOpportunity,
  OpportunityParentOrg,
} from "./StudentOpportunityClient";

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type Props = {
  params: Promise<{ id: string }>;
};

type OpportunityResponse = {
  opportunity: StudentOpportunity;
  organization: OpportunityParentOrg | null;
};

async function getOpportunity(id: string): Promise<OpportunityResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/students/opportunities/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as OpportunityResponse;
  } catch (err) {
    console.error(`Error fetching opportunity ${id}:`, err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getOpportunity(id);

  if (!data) {
    return {
      title: "Opportunity Not Found | OneTownCity",
      description: "The requested student internship, scholarship, or drive could not be found.",
    };
  }

  const { opportunity } = data;
  const title = `${opportunity.title} — Verified Student Opportunity in ${opportunity.city}`;
  const description = opportunity.description.slice(0, 160);
  const canonicalUrl = `${SITE_URL}/students/${opportunity.id}`;

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
    },
  };
}

export default async function StudentOpportunityPage({ params }: Props) {
  const { id } = await params;
  const data = await getOpportunity(id);

  if (!data) {
    notFound();
  }

  return (
    <StudentOpportunityClient
      opportunity={data.opportunity}
      organization={data.organization}
    />
  );
}
