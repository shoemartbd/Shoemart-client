/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { getHeroSliders } from "@/services/heroSlider.services";

// Wraps an image in a link only when the admin set one
function MaybeLink({
  href,
  className,
  children,
}: {
  href?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href) return <div className={className}>{children}</div>;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function HeroCarousel() {
  const [slides, setSlides] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // Track position. Runs 0..slides.length, where slides.length is a copy of
  // the first slide placed after the last one. Reaching the copy snaps back to
  // the real first slide with the transition off, so the loop keeps moving
  // forward instead of rewinding through every slide.
  const [pos, setPos] = useState(0);
  const [animate, setAnimate] = useState(true);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [failedVideos, setFailedVideos] = useState<string[]>([]);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const data: any[] = (await getHeroSliders()) || [];
        const active = data.filter((s) => s.isActive !== false);
        setSlides(active.filter((s) => s.type !== "BANNER"));
      } catch (error) {
        console.error("Failed to load hero sliders:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchSliders();
  }, []);

  const current = slides.length ? pos % slides.length : 0;

  // From the copy (if the snap-back was missed) go on to slide 2
  const goNext = () => {
    setAnimate(true);
    setPos((p) => (p >= slides.length ? 1 : p + 1));
  };

  const goTo = (i: number) => {
    setAnimate(true);
    setPos(i);
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (pos >= slides.length) {
      setAnimate(false);
      setPos(0);
    }
  };

  // Images stay 5s. A video slide plays to the end and then moves on
  // (see onEnded below), so it gets no timer here.
  // A video that failed to load falls back to the image timer so the slider never gets stuck.
  const currentIsVideo =
    slides[current]?.mediaType === "VIDEO" &&
    !failedVideos.includes(slides[current]?.id);
  useEffect(() => {
    if (slides.length <= 1 || currentIsVideo) return;
    const timer = setTimeout(goNext, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, current, currentIsVideo]);

  // Play only the visible video, from the start; pause the rest
  useEffect(() => {
    slides.forEach((slide, i) => {
      const video = videoRefs.current[slide.id];
      if (!video) return;
      if (i === current) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [slides, current]);

  if (!isLoaded) {
    return <div className="aspect-2/1 rounded-2xl bg-muted animate-pulse md:aspect-3/1" />;
  }

  if (slides.length === 0) return null;

  return (
    <section
      aria-label="Featured offers"
      className="relative aspect-2/1 w-full overflow-hidden rounded-2xl md:aspect-3/1"
    >
      <div
        className={`flex h-full ${animate ? "transition-transform duration-700" : ""}`}
        style={{ transform: `translateX(-${pos * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((slide, i) => (
          <MaybeLink
            key={slide.id}
            href={slide.link}
            className="relative block h-full min-w-full"
          >
            {slide.mediaType === "VIDEO" ? (
              <video
                ref={(el) => {
                  videoRefs.current[slide.id] = el;
                }}
                src={slide.image}
                muted
                playsInline
                preload={i === 0 ? "auto" : "metadata"}
                loop={slides.length === 1}
                onEnded={goNext}
                onError={() =>
                  setFailedVideos((prev) =>
                    prev.includes(slide.id) ? prev : [...prev, slide.id],
                  )
                }
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <Image
                src={slide.image}
                alt={`Slide ${i + 1}`}
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover"
              />
            )}
          </MaybeLink>
        ))}

        {/* Copy of the first slide for the seamless loop */}
        {slides.length > 1 && (
          <div aria-hidden className="relative block h-full min-w-full">
            {slides[0].mediaType === "VIDEO" ? (
              <video
                src={slides[0].image}
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <Image
                src={slides[0].image}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
            )}
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <>
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  current === i
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
