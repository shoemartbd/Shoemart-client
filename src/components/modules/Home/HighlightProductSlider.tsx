"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllProducts } from "@/services/product.services";
import { IProduct } from "@/components/modules/Admin/Product/productColumns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ProductHighlight } from "@/lib/productHighlights";
import SectionTitle from "@/components/shared/SectionTitle";
import ProductCard from "./ProductCard";

const PRODUCT_COUNT = 12;
const SLIDE_EVERY_MS = 3000;


// Cards visible at once; must match the basis-* classes on each slide below
const getPerView = (width: number) =>
  width >= 1024 ? 4 : width >= 768 ? 3 : 2;

interface HighlightProductSliderProps {
  highlight: ProductHighlight;
  title: string;
}

// Auto-sliding row of products carrying one highlight label (Trending, New Arrival, ...)
export default function HighlightProductSlider({
  highlight,
  title,
}: HighlightProductSliderProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "highlight", highlight],
    queryFn: () =>
      getAllProducts({ highlight, limit: String(PRODUCT_COUNT), view: "card" }),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <ProductSlider
      title={title}
      moreHref={`/products?highlight=${highlight}`}
      products={(data?.data || []).slice(0, PRODUCT_COUNT)}
      isLoading={isLoading}
    />
  );
}

interface ProductSliderProps {
  title: string;
  moreHref: string;
  products: IProduct[];
  isLoading?: boolean;
}

// The homepage product row: title + "More Products" link over an endless
// auto-slider. Shared by the highlight rows and the category sections.
export function ProductSlider({
  title,
  moreHref,
  products,
  isLoading = false,
}: ProductSliderProps) {
  const [perView, setPerView] = useState(4);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const update = () => setPerView(getPerView(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const canSlide = products.length > perView;

  // Endless loop: the first `perView` cards are appended after the last one.
  // When the track reaches that copy it snaps back to the real start with the
  // transition off, which looks identical, so the loop has no visible jump.
  const slides = canSlide ? [...products, ...products.slice(0, perView)] : products;

  useEffect(() => {
    if (!canSlide || paused) return;
    const timer = setInterval(() => {
      setAnimate(true);
      setIndex((i) => i + 1);
    }, SLIDE_EVERY_MS);
    return () => clearInterval(timer);
  }, [canSlide, paused]);

  const handleTransitionEnd = () => {
    if (index >= products.length) {
      setAnimate(false);
      setIndex(0);
    }
  };

  const goPrev = () => {
    if (index === 0) {
      // Jump to the matching copy at the end, then slide back one
      setAnimate(false);
      setIndex(products.length);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setAnimate(true);
          setIndex(products.length - 1);
        }),
      );
    } else {
      setAnimate(true);
      setIndex((i) => i - 1);
    }
  };

  const goNext = () => {
    setAnimate(true);
    setIndex((i) => Math.min(i + 1, products.length));
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <section aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-3 md:mb-6 md:gap-4">
        <SectionTitle title={title} />
        <Link
          href={moreHref}
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-foreground transition-colors hover:text-primary sm:gap-1.5 sm:text-sm"
        >
          More Products <ArrowRight className="size-3.5 sm:size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "space-y-3 border p-3",
                i >= 2 && "hidden md:block",
                i >= 3 && "md:hidden lg:block",
                i >= 4 && "lg:hidden xl:block",
              )}
            >
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="-mx-2 overflow-hidden">
            <div
              className={cn(
                "flex",
                animate && "transition-transform duration-500 ease-out",
              )}
              style={{ transform: `translateX(-${(index * 100) / perView}%)` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {slides.map((product, i) => (
                <div
                  key={`${product.id}-${i}`}
                  className="shrink-0 basis-1/2 px-2 md:basis-1/3 lg:basis-1/4"
                  aria-hidden={i >= products.length}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {canSlide && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous products"
                className="absolute -left-2 top-1/3 rounded-full bg-background/90 p-2 shadow-md ring-1 ring-black/5 transition hover:scale-105 md:-left-4"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next products"
                className="absolute -right-2 top-1/3 rounded-full bg-background/90 p-2 shadow-md ring-1 ring-black/5 transition hover:scale-105 md:-right-4"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
