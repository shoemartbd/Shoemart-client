"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import SectionHeading from "@/components/shared/SectionHeading";
import { getTestimonials } from "@/services/testimonial.services";
import { ITestimonial } from "@/types/testimonial.types";
import { cn } from "@/lib/utils";

const SLIDE_EVERY_MS = 4000;

// Cards visible at once; must match the basis-* classes on each slide below
const getPerView = (width: number) =>
  width >= 1024 ? 3 : width >= 768 ? 2 : 1;

function TestimonialCard({ t }: { t: ITestimonial }) {
  return (
    <div className="p-8 rounded-2xl bg-card border shadow-xl shadow-slate-200/20 dark:shadow-none flex flex-col h-full">
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${index < t.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
      <p className="text-muted-foreground font-medium leading-relaxed mb-8 flex-1 italic">
        &quot;{t.content}&quot;
      </p>
      <div className="flex items-center gap-4 pt-6 border-t">
        <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden border-2 border-primary/20 bg-primary/10">
          {t.avatar ? (
            <Image
              src={t.avatar}
              alt={t.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-bold text-primary">
              {t.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h4 className="font-black text-foreground text-sm">{t.name}</h4>
          {t.role && (
            <p className="text-primary font-bold text-[10px] uppercase tracking-widest">
              {t.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Customer reviews managed from Dashboard → Pages → Home. Slides when there
// are more than fit on screen.
export default function Testimonials() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ["testimonials", "public"],
    queryFn: () => getTestimonials(),
    staleTime: 10 * 60 * 1000,
  });

  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const update = () => setPerView(getPerView(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const canSlide = testimonials.length > perView;

  // Endless loop: the first `perView` cards are appended after the last one.
  // When the track reaches that copy it snaps back to the real start with the
  // transition off, which looks identical, so the loop has no visible jump.
  const slides = canSlide
    ? [...testimonials, ...testimonials.slice(0, perView)]
    : testimonials;

  useEffect(() => {
    if (!canSlide || paused) return;
    const timer = setInterval(() => {
      setAnimate(true);
      setIndex((i) => i + 1);
    }, SLIDE_EVERY_MS);
    return () => clearInterval(timer);
  }, [canSlide, paused]);

  const handleTransitionEnd = () => {
    if (index >= testimonials.length) {
      setAnimate(false);
      setIndex(0);
    }
  };

  const goPrev = () => {
    if (index === 0) {
      // Jump to the matching copy at the end, then slide back one
      setAnimate(false);
      setIndex(testimonials.length);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setAnimate(true);
          setIndex(testimonials.length - 1);
        }),
      );
    } else {
      setAnimate(true);
      setIndex((i) => i - 1);
    }
  };

  const goNext = () => {
    setAnimate(true);
    setIndex((i) => Math.min(i + 1, testimonials.length));
  };

  if (testimonials.length === 0) return null;

  return (
    <section className="py-10">
      <SectionHeading
        eyebrow="Testimonials"
        title="What Our Community Says"
        subtitle="Hear from our community of shoppers who make Shoe Mart their go-to online store."
        className="mb-16"
      />

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="-mx-4 overflow-hidden py-2">
          <div
            className={cn(
              "flex",
              !canSlide && "justify-center",
              animate && "transition-transform duration-500 ease-out",
            )}
            // A resize can leave everything on screen; then show from the start
            style={{
              transform: `translateX(-${((canSlide ? index : 0) * 100) / perView}%)`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((t, i) => (
              <div
                key={`${t.id}-${i}`}
                className="shrink-0 basis-full px-4 md:basis-1/2 lg:basis-1/3"
                aria-hidden={i >= testimonials.length}
              >
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        </div>

        {canSlide && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous testimonials"
              className="absolute -left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-md ring-1 ring-black/5 transition hover:scale-105 md:-left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next testimonials"
              className="absolute -right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-md ring-1 ring-black/5 transition hover:scale-105 md:-right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
