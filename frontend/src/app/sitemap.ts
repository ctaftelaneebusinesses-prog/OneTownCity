import { MetadataRoute } from "next";

const API_BASE = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface ListingItem {
  slug: string;
  updated_at?: string;
  created_at?: string;
}

interface NewsItem {
  id: string;
  slug: string;
  updated_at?: string;
  created_at?: string;
}

interface OpportunityItem {
  id: string;
  slug: string;
  created_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/trust`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/architecture`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  try {
    const [listingsRes, newsRes, oppsRes] = await Promise.allSettled([
      fetch(`${API_BASE}/listings?limit=100`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/news?limit=50`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/students/opportunities?limit=50`, { next: { revalidate: 3600 } }),
    ]);

    if (listingsRes.status === "fulfilled" && listingsRes.value.ok) {
      const listings = (await listingsRes.value.json()) as ListingItem[];
      for (const item of listings) {
        routes.push({
          url: `${SITE_URL}/listings/${item.slug}`,
          lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
    }

    if (newsRes.status === "fulfilled" && newsRes.value.ok) {
      const news = (await newsRes.value.json()) as NewsItem[];
      for (const item of news) {
        if (item.slug) {
          routes.push({
            url: `${SITE_URL}/news/${item.slug}`,
            lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
            changeFrequency: "daily",
            priority: 0.7,
          });
        }
      }
    }

    if (oppsRes.status === "fulfilled" && oppsRes.value.ok) {
      const opps = (await oppsRes.value.json()) as OpportunityItem[];
      for (const item of opps) {
        if (item.id) {
          routes.push({
            url: `${SITE_URL}/students/${item.id}`,
            lastModified: item.created_at ? new Date(item.created_at) : new Date(),
            changeFrequency: "daily",
            priority: 0.7,
          });
        }
      }
    }
  } catch (err) {
    console.error("Error generating dynamic sitemap:", err);
  }

  return routes;
}
