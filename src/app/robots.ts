import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

// Built per request, so the address is the live domain (from
// NEXT_PUBLIC_SITE_URL or the request), never the build machine's localhost
export const dynamic = "force-dynamic";

// /robots.txt: crawl the shop, skip private and checkout pages
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard",
          "/api/",
          "/cart",
          "/checkout",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/order-confirmation/",
          "/payment",
          "/payment-failed",
          "/track-order",
          "/sample-works/",
          // Filtered / searched listings duplicate /products
          "/products?*searchTerm=",
          "/products?*sortBy=",
          "/products?*minPrice=",
          "/products?*maxPrice=",
          "/products?*page=",
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
