import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsDetailClient, TownNews } from "./NewsDetailClient";

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type Props = {
  params: Promise<{ slug: string }>;
};

type NewsResponse = {
  news: TownNews;
  related_news: TownNews[];
};

async function getNews(slug: string): Promise<NewsResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/news/${slug}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as NewsResponse;
  } catch (err) {
    console.error(`Error fetching news ${slug}:`, err);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getNews(slug);

  if (!data) {
    return {
      title: "News Item Not Found | OneTownCity",
      description: "The requested town update or announcement could not be found.",
    };
  }

  const { news } = data;
  const title = `${news.title} — ${news.city} Town Pulse`;
  const description = news.content.slice(0, 160);
  const canonicalUrl = `${SITE_URL}/news/${news.slug}`;

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
      type: "article",
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getNews(slug);

  if (!data) {
    notFound();
  }

  return <NewsDetailClient news={data.news} relatedNews={data.related_news} />;
}
