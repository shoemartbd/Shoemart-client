import { headers } from "next/headers";
import type { Metadata } from "next";
import { stripHtml } from "@/lib/utils";

// Search-engine helpers: the public site address, page metadata and
// structured data (JSON-LD) that Google reads for rich results.

export const SITE_NAME = "Shoe Mart";
export const DEFAULT_DESCRIPTION =
  "Shop the latest shoes, sneakers, sandals & more for men, women and kids, delivered across Bangladesh.";

// The live site address. Set NEXT_PUBLIC_SITE_URL (e.g. https://www.shoemart.com.bd)
// in production; without it the address of the current request is used.
export const getSiteUrl = async () => {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto =
        h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // outside a request (build time)
  }
  return "http://localhost:3000";
};

// Plain text for meta descriptions: no HTML, one line, ~160 characters
export const metaText = (value?: string | null, max = 160) => {
  const text = stripHtml(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
};

// Metadata for a simple public page
export const pageMetadata = (
  title: string,
  description: string,
  path: string,
  options: { noindex?: boolean } = {},
): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: { title, description, url: path, siteName: SITE_NAME, type: "website" },
  ...(options.noindex && { robots: { index: false, follow: true } }),
});

// Pages that should never show up in search (cart, checkout, account, ...)
export const privateMetadata = (title: string): Metadata => ({
  title: `${title} | ${SITE_NAME}`,
  robots: { index: false, follow: false },
});

// <script type="application/ld+json"> content, safe inside HTML
export const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
