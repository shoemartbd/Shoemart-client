"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageSliderProps {
  images: string[];
  alt: string;
}

const AUTO_ADVANCE_MS = 3500;
const LOOP_RESET_DELAY_MS = 550; // must exceed the smooth-scroll transition time

// ≤3 images: centered, evenly-spaced static row.
// >3 images: auto-advancing infinite-loop slider with arrows + dot indicators.
// The loop illusion works by appending one clone of the first slide at the
// end — sliding "into" it looks identical to continuing on to slide 0, so we
// can silently (non-animated) snap the scroll position back once it lands there.
export default function ImageSlider({ images, alt }: ImageSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState(0);
  const isCentered = images.length <= 3;
  const slides = isCentered ? images : [...images, images[0]];
  const activeIndex = pointer % images.length;

  const scrollToChild = (index: number, smooth: boolean) => {
    const track = trackRef.current;
    const child = track?.children[index] as HTMLElement | undefined;
    if (!track || !child) return;
    const trackRect = track.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();
    const offset = childRect.left - trackRect.left + track.scrollLeft;
    track.scrollTo({ left: offset, behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    if (isCentered) return;
    scrollToChild(pointer, true);
  }, [pointer, isCentered]);

  // Landed on the cloned slide (looks like slide 0) — snap back invisibly so
  // the pointer can keep counting forward next time without ever running out of slides.
  useEffect(() => {
    if (isCentered || pointer !== images.length) return;
    const timeout = setTimeout(() => {
      scrollToChild(0, false);
      setPointer(0);
    }, LOOP_RESET_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [pointer, images.length, isCentered]);

  useEffect(() => {
    if (isCentered || images.length <= 1) return;
    const timer = setInterval(() => {
      setPointer((prev) => prev + 1);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [isCentered, images.length]);

  if (images.length === 0) return null;

  const goNext = () => setPointer((prev) => (prev + 1) % images.length);
  const goPrev = () => setPointer((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className={`flex gap-4 overflow-x-auto scrollbar-hide pb-2 ${
          isCentered ? "flex-wrap justify-center" : "snap-x snap-mandatory"
        }`}
      >
        {slides.map((img, i) => (
          <div
            key={i}
            className={`relative shrink-0 ${!isCentered ? "snap-center" : ""} w-56 sm:w-64 aspect-square rounded-xl overflow-hidden border shadow-sm`}
          >
            <Image src={img} alt={`${alt} ${(i % images.length) + 1}`} fill sizes="256px" className="object-cover" />
          </div>
        ))}
      </div>

      {!isCentered && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous"
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 h-10 w-10 rounded-full bg-background border shadow-md items-center justify-center hover:bg-muted z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next"
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 h-10 w-10 rounded-full bg-background border shadow-md items-center justify-center hover:bg-muted z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="flex justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setPointer(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
