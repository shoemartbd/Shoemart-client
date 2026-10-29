"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getHomePromo } from "@/services/homePromo.services";

// Scrolling announcement line + wide promo banner, both set from
// Dashboard → Pages → Home. Either part hides when empty or switched off.
export default function PromoStrip() {
  const { data: promo } = useQuery({
    queryKey: ["home-promo"],
    queryFn: () => getHomePromo(),
    staleTime: 5 * 60 * 1000,
  });

  const tickerText = promo?.tickerEnabled ? promo.tickerText?.trim() : "";
  const bannerImage = promo?.bannerEnabled ? promo.bannerImage : null;

  if (!tickerText && !bannerImage) return null;

  const banner = bannerImage && (
    <div className="relative aspect-[1920/330] w-full overflow-hidden rounded-2xl bg-muted">
      <Image
        src={bannerImage}
        alt="Promotion"
        fill
        sizes="(min-width: 1440px) 1376px, 100vw"
        className="object-cover"
      />
    </div>
  );

  return (
    <section aria-label="Announcements" className="space-y-3">
      {tickerText && (
        // The text is repeated in two identical halves and the track slides by
        // half its width (brand-marquee keyframes), so it loops seamlessly.
        <div className="group overflow-hidden rounded-full bg-primary py-2 text-primary-foreground">
          <div
            className="flex w-max animate-[brand-marquee_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
            style={{ animationDuration: `${Math.max(20, tickerText.length * 0.35)}s` }}
          >
            {[0, 1].map((half) => (
              <div key={half} className="flex shrink-0" aria-hidden={half === 1}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    className="flex items-center whitespace-nowrap px-8 text-sm font-semibold tracking-wide"
                  >
                    {tickerText}
                    <span className="ml-16 opacity-60">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {banner &&
        (promo?.bannerLink ? (
          <Link href={promo.bannerLink} className="block">
            {banner}
          </Link>
        ) : (
          banner
        ))}
    </section>
  );
}
