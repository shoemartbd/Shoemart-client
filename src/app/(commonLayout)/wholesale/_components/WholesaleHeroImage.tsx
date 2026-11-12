"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getHeroSliders } from "@/services/heroSlider.services";
import { cn } from "@/lib/utils";

// Built-in photo in public/ (square), used until a banner is added
const DEFAULT_IMAGE = "/Wholesale.png";
const ROTATE_MS = 4000;

interface IWholesaleBanner {
  id: string;
  image: string;
  link: string | null;
}

// Hero photo of the wholesale page. Set from Dashboard → Banner & Slider →
// Wholesale Page Banner; several fade in turn. Without one, the default photo
// (or else the first category image) shows.
export default function WholesaleHeroImage({ fallback }: { fallback?: string | null }) {
  const { data: sliders } = useQuery({
    queryKey: ["hero-sliders"],
    queryFn: () => getHeroSliders(),
    staleTime: 5 * 60 * 1000,
  });
  const banners: IWholesaleBanner[] = (Array.isArray(sliders) ? sliders : []).filter(
    (s: { type?: string; isActive?: boolean; mediaType?: string }) =>
      s.type === "WHOLESALE" && s.isActive !== false && s.mediaType !== "VIDEO",
  );

  const [index, setIndex] = useState(0);
  const [defaultSrc, setDefaultSrc] = useState(DEFAULT_IMAGE);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % banners.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [banners.length]);

  const current = banners.length ? index % banners.length : 0;

  return (
    <div className="relative mx-auto w-full max-w-md lg:ml-auto lg:max-w-lg">
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#d7141f]/40 via-transparent to-white/10 blur-2xl"
      />
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-[#141414] shadow-2xl">
        {banners.length > 0 ? (
          banners.map((b, i) => {
            const img = (
              <Image
                src={b.image}
                alt="Shoe Mart wholesale"
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 512px, 90vw"
                className="object-cover"
              />
            );
            return (
              <div
                key={b.id}
                aria-hidden={i !== current}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  i === current ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                {b.link ? (
                  <Link href={b.link} className="block h-full w-full" tabIndex={i === current ? 0 : -1}>
                    {img}
                  </Link>
                ) : (
                  img
                )}
              </div>
            );
          })
        ) : (
          <Image
            src={defaultSrc}
            alt="Shoe Mart wholesale"
            fill
            priority
            sizes="(min-width: 1024px) 512px, 90vw"
            className="object-cover"
            onError={() => {
              if (fallback && defaultSrc !== fallback) setDefaultSrc(fallback);
            }}
          />
        )}

        {banners.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === current ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
