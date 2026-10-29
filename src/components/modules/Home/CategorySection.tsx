/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllCategories } from "@/services/category.services";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SLIDE_EVERY_MS = 3000;
const SWIPE_PX = 40;

// One slot: 2 per row on phones, 4 on desktop. The padding is the gap
// (the track's negative margin cancels it at the edges).
const SLOT = "w-1/2 shrink-0 p-1.5 md:p-2.5 lg:w-1/4";

// Same breakpoint as lg:w-1/4 above
const perViewFor = (screen: number) => (screen >= 1024 ? 4 : 2);

// Category banners under the hero slider. Centred when they all fit,
// otherwise an endless auto-slider.
// The admin's category image is the whole card (title is designed into it),
// so the name only shows when no image was uploaded.
export default function CategorySection() {
  const { data, isLoading } = useQuery({
    // Own key: this asks for every top-level category, not the default 10
    queryKey: ["categories", "home-top-level"],
    queryFn: () => getAllCategories({ limit: "200" }),
    staleTime: 10 * 60 * 1000, // cache for 10 minutes
  });

  // Only active top-level categories
  const categories =
    data?.data?.filter((c: any) => c.isActive !== false && !c.parentId) || [];

  if (!isLoading && categories.length === 0) return null;

  return (
    <section aria-label="Categories">
      {isLoading ? (
        <div className="-m-1.5 flex justify-center overflow-hidden md:-m-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={SLOT}>
              <Skeleton className="aspect-15/8 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <CategoryBannerSlider categories={categories} />
      )}
    </section>
  );
}

function CategoryBannerSlider({ categories }: { categories: any[] }) {
  const [perView, setPerView] = useState(4);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const measure = () => setPerView(perViewFor(window.innerWidth));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const count = categories.length;
  const canSlide = count > perView;

  // The first `perView` items are repeated after the last one; reaching the
  // copy snaps back to the start with the transition off, so it never rewinds
  const slides = canSlide ? [...categories, ...categories.slice(0, perView)] : categories;
  const position = canSlide ? Math.min(index, count) : 0;

  useEffect(() => {
    if (!canSlide || paused) return;
    const timer = setInterval(() => {
      setAnimate(true);
      setIndex((i) => (i >= count ? 1 : i + 1));
    }, SLIDE_EVERY_MS);
    return () => clearInterval(timer);
  }, [canSlide, paused, count]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (index >= count) {
      setAnimate(false);
      setIndex(0);
    }
  };

  const goNext = () => {
    setAnimate(true);
    setIndex((i) => (i >= count ? 1 : i + 1));
  };

  const goPrev = () => {
    if (position === 0) {
      // Jump to the copy at the end, then slide back one
      setAnimate(false);
      setIndex(count);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setAnimate(true);
          setIndex(count - 1);
        }),
      );
    } else {
      setAnimate(true);
      setIndex((i) => i - 1);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="-m-1.5 overflow-hidden md:-m-2.5"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          setPaused(true);
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          setPaused(false);
          if (start === null || !canSlide) return;
          const delta = e.changedTouches[0].clientX - start;
          if (delta <= -SWIPE_PX) goNext();
          else if (delta >= SWIPE_PX) goPrev();
        }}
      >
        <div
          className={cn(
            "flex",
            canSlide ? "justify-start" : "justify-center",
            animate && "transition-transform duration-500 ease-out",
          )}
          style={{ transform: `translateX(-${(position * 100) / perView}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((category, i) => (
            <div
              key={`${category.id}-${i}`}
              className={SLOT}
              aria-hidden={i >= count}
              // Copies at the end aren't reachable by keyboard
              inert={i >= count}
            >
              <CategoryBanner category={category} />
            </div>
          ))}
        </div>
      </div>

      {canSlide && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous categories"
            className="absolute -left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-1.5 shadow-md ring-1 ring-black/5 transition hover:scale-105 md:-left-3"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next categories"
            className="absolute -right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-1.5 shadow-md ring-1 ring-black/5 transition hover:scale-105 md:-right-3"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}

function CategoryBanner({ category }: { category: any }) {
  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      className="group relative block aspect-15/8 w-full overflow-hidden rounded-xl bg-muted"
    >
      {category.image ? (
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <span className="absolute left-4 top-3 text-base font-black uppercase leading-tight text-slate-800 dark:text-slate-100 md:left-6 md:top-5 md:text-2xl">
          {category.name}
          <span className="block text-[10px] font-medium tracking-wide md:text-xs">
            Collection
          </span>
        </span>
      )}
    </Link>
  );
}
