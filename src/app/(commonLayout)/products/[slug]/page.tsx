/* eslint-disable @typescript-eslint/no-explicit-any */
import ProductDetails from "@/components/modules/Product/ProductDetails";
import { getProductBySlug } from "@/services/product.services";
import { getSiteUrl, jsonLd, metaText, SITE_NAME } from "@/lib/seo";
import { Metadata } from "next";
import { cache } from "react";

// generateMetadata and the page both need the product; one request serves both
const loadProduct = cache((slug: string) => getProductBySlug(slug));

interface Props {
  params: Promise<{ slug: string }>;
}

const descriptionOf = (product: any) =>
  metaText(product.shortDescription) ||
  metaText(product.description) ||
  `Buy ${product.name} online at ${SITE_NAME}. Cash on delivery across Bangladesh.`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await loadProduct(slug);
    const product = response?.data;

    if (!product) {
      return { title: "Product Not Found", robots: { index: false, follow: true } };
    }

    const title = `${product.name} | ${SITE_NAME}`;
    const description = descriptionOf(product);
    const path = `/products/${product.slug}`;
    const images = (product.images ?? []).slice(0, 4).map((url: string) => ({
      url,
      alt: product.name,
    }));

    return {
      title,
      description,
      keywords: [
        product.name,
        product.category?.name,
        product.brand?.name,
        ...(product.tags ?? []),
        "Bangladesh",
      ].filter(Boolean),
      alternates: { canonical: path },
      openGraph: {
        type: "website",
        siteName: SITE_NAME,
        title,
        description,
        url: path,
        images,
      },
      twitter: { card: "summary_large_image", title, description, images: images.map((i: any) => i.url) },
      // Drafts / hidden products stay out of search
      ...(product.status !== "ACTIVE" && { robots: { index: false, follow: false } }),
    };
  } catch {
    return { title: `Product | ${SITE_NAME}`, robots: { index: false, follow: true } };
  }
}

// schema.org Product + breadcrumbs, for Google rich results (price, stock, rating)
const productJsonLd = (product: any, siteUrl: string) => {
  const url = `${siteUrl}/products/${product.slug}`;
  const variants: any[] = product.type === "VARIABLE" ? (product.variants ?? []) : [];
  const prices = (variants.length ? variants.map((v) => v.sellPrice) : [product.sellPrice])
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
  const inStock = variants.length
    ? variants.some((v) => (v.quantity ?? 0) > 0)
    : (product.stock ?? 0) > 0;
  const availability = inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const low = prices.length ? Math.min(...prices) : 0;
  const high = prices.length ? Math.max(...prices) : 0;
  const ratings: number[] = (product.reviews ?? [])
    .map((r: any) => Number(r.rating))
    .filter((n: number) => n >= 1 && n <= 5);

  const offers =
    low !== high
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "BDT",
          lowPrice: low,
          highPrice: high,
          offerCount: variants.length,
          availability,
          url,
        }
      : {
          "@type": "Offer",
          priceCurrency: "BDT",
          price: low,
          availability,
          itemCondition: "https://schema.org/NewCondition",
          url,
          seller: { "@type": "Organization", name: SITE_NAME },
        };

  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: descriptionOf(product),
      image: product.images ?? [],
      url,
      sku: product.sku || variants.find((v) => v.sku)?.sku || undefined,
      ...(product.brand?.name && { brand: { "@type": "Brand", name: product.brand.name } }),
      ...(product.category?.name && { category: product.category.name }),
      ...(low > 0 && { offers }),
      ...(ratings.length > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: Number((ratings.reduce((s, n) => s + n, 0) / ratings.length).toFixed(1)),
          reviewCount: ratings.length,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Products", item: `${siteUrl}/products` },
        ...(product.category?.name
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: product.category.name,
                item: `${siteUrl}/products?categoryId=${product.category.id}`,
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: product.category?.name ? 4 : 3,
          name: product.name,
          item: url,
        },
      ],
    },
  ];
};

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  let product = null;
  let hasError = false;

  try {
    const response = await loadProduct(slug);
    product = response?.data;
  } catch {
    hasError = true;
  }

  if (hasError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">
            Failed to load product details. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">
            Product Not Found
          </h1>
          <p className="text-muted-foreground">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  const siteUrl = await getSiteUrl();

  return (
    <>
      {product.status === "ACTIVE" && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd(product, siteUrl)) }}
        />
      )}
      <ProductDetails product={product} />
    </>
  );
}
