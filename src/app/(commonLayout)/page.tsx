import HeroCarousel from "@/components/modules/Home/HeroCarousel";
import PromoStrip from "@/components/modules/Home/PromoStrip";
import ProductsBanner from "@/components/modules/Home/ProductsBanner";
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

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <main className="w-full max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 lg:space-y-10">
        <HeroCarousel />
        <CategorySection />
        <PromoStrip />
        <HighlightProductSlider highlight="NEW_ARRIVAL" title="New Arrivals" />
        <FlashSale />
        <HighlightProductSlider highlight="TOP_SELLING" title="Top Selling Products" />
        <HighlightProductSlider highlight="TRENDING" title="Trending Products" />
        <ProductsBanner />
        <HomeProducts />
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
