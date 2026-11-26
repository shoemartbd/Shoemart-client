import HeroCarousel from "@/components/modules/Home/HeroCarousel";
import PromoStrip from "@/components/modules/Home/PromoStrip";
import ProductsBanner from "@/components/modules/Home/ProductsBanner";
import HomeShowcase from "@/components/modules/Home/HomeShowcase";
import HighlightProductSlider from "@/components/modules/Home/HighlightProductSlider";
import HomeProducts from "@/components/modules/Home/HomeProducts";
import CategorySection from "@/components/modules/Home/CategorySection";
import HomeCategorySections from "@/components/modules/Home/HomeCategorySections";
import Features from "@/components/modules/Home/Features";
// import MarketplaceStats from "@/components/modules/Home/MarketplaceStats";
import ClientLogos from "@/components/modules/Home/ClientLogos";
import Testimonials from "@/components/modules/Home/Testimonials";
import FaqSection from "@/components/modules/Home/FaqSection";
// import Newsletter from "@/components/modules/Home/Newsletter";
import FlashSale from "@/components/modules/Home/FlashSale";
import type { Metadata } from "next";
import { getSiteSettings } from "@/services/siteSetting.services";
import { getHeroSliders } from "@/services/heroSlider.services";
import { DEFAULT_DESCRIPTION, getSiteUrl, jsonLd, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Who the shop is (name, logo, contact, social pages) and the site search,
// for Google's knowledge panel and sitelinks search box
const homeJsonLd = async () => {
  const site = await getSiteUrl();
  const settings = (await getSiteSettings().catch(() => null))?.data;
  const name = settings?.siteName || SITE_NAME;
  const sameAs = [
    settings?.facebook,
    settings?.instagram,
    settings?.youtube,
    settings?.linkedin,
    settings?.tiktok,
  ].filter(Boolean);
  return [
    {
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      name,
      url: site,
      logo: settings?.logo || `${site}/mainlogo.jpeg`,
      description: settings?.description || DEFAULT_DESCRIPTION,
      ...(settings?.phone && { telephone: settings.phone }),
      ...(settings?.email && { email: settings.email }),
      ...(settings?.address && {
        address: { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "BD" },
      }),
      ...(sameAs.length > 0 && { sameAs }),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name,
      url: site,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${site}/products?searchTerm={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ];
};

export default async function HomePage() {
  // Fetched with the page: the hero banner is the largest image (LCP)
  const [structuredData, heroSlides] = await Promise.all([
    homeJsonLd(),
    getHeroSliders().catch(() => null),
  ]);
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
      />
      {/* Page heading for search engines and screen readers (the hero is visual) */}
      <h1 className="sr-only">
        {SITE_NAME}: Online Shoe Store in Bangladesh for Men, Women and Kids
      </h1>
      {/* Edge to edge, outside the centred content column */}
      <HeroCarousel initialSlides={Array.isArray(heroSlides) ? heroSlides : null} />
      <main className="w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 lg:space-y-10">
        <CategorySection />
        <PromoStrip />
        <HighlightProductSlider highlight="NEW_ARRIVAL" title="New Arrivals" />
        <FlashSale />
        <HighlightProductSlider highlight="TOP_SELLING" title="Top Selling Products" />
        <HighlightProductSlider highlight="TRENDING" title="Trending Products" />
        <HomeShowcase />
        <HomeProducts />
        <ProductsBanner />
        <HomeCategorySections />
        <Features />
        {/* <MarketplaceStats /> */}
        <ClientLogos />
        <Testimonials />
        <FaqSection />
        {/* <Newsletter /> */}
      </main>
    </div>
  );
}
