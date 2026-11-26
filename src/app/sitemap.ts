import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

type SitemapData = {
  products: { slug: string; name: string; images: string[]; updatedAt: string }[];
  blogs: { slug: string; title: string; coverImage: string | null; updatedAt: string }[];
};

// Live products and blog posts, from the server (refreshed every 10 minutes)
const loadData = async (): Promise<SitemapData> => {
  try {
    const res = await fetch(`${API}/seo/sitemap`, { next: { revalidate: 600 } });
    if (!res.ok) return { products: [], blogs: [] };
    const body = await res.json();
    return body?.data ?? { products: [], blogs: [] };
  } catch {
    return { products: [], blogs: [] };
  }
};

// Built per request, so the address is the live domain (from
// NEXT_PUBLIC_SITE_URL or the request), never the build machine's localhost
export const dynamic = "force-dynamic";

// /sitemap.xml: every page Google should index, with product photos
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteUrl();
  const { products, blogs } = await loadData();
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: site, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${site}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${site}/wholesale`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site}/our-stores`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site}/blogs`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${site}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${site}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site}/refund-policy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${site}/products/${encodeURIComponent(p.slug)}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
    images: p.images,
  }));

  const blogPages: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${site}/blogs/${encodeURIComponent(b.slug)}`,
    lastModified: new Date(b.updatedAt),
    changeFrequency: "monthly",
    priority: 0.5,
    ...(b.coverImage && { images: [b.coverImage] }),
  }));

  return [...pages, ...productPages, ...blogPages];
}
