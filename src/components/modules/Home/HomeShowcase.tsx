"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getHomePromo } from "@/services/homePromo.services";
import { cn } from "@/lib/utils";

// Showcase above "All Products": photo | video | photo in one rounded strip
// (on phones the video sits on top, the two photos side by side below).
// Every cell keeps its upload ratio on every screen, so nothing is cropped:
// photos 4:5 (800 x 1000), video square (1080 x 1080). On desktop the widths
// are 4 : 5 : 4, which gives the three the same height.
// Set from Dashboard → Homepage (Promo Banners). Hidden when off or empty.
export default function HomeShowcase() {
  const { data: promo } = useQuery({
    queryKey: ["home-promo"],
    queryFn: () => getHomePromo(),
    staleTime: 5 * 60 * 1000,
  });

  if (!promo?.showcaseEnabled) return null;
  const { showcaseLeftImage: left, showcaseVideo: video, showcaseRightImage: right } = promo;
  if (!left && !video && !right) return null;

  const photos = [left, right].filter(Boolean).length;

  return (
    <section
      aria-label="Showcase"
      className="flex flex-wrap items-start overflow-hidden rounded-2xl bg-muted md:flex-nowrap"
    >
      {video && (
        <Cell
          href={promo.showcaseVideoLink}
          className="order-first aspect-square w-full md:order-none md:w-auto md:flex-[5_1_0%]"
        >
          <video
            src={video}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full bg-black object-cover"
          />
        </Cell>
      )}
      {left && (
        <Cell
          href={promo.showcaseLeftLink}
          className={cn(
            "relative aspect-[4/5] md:-order-1 md:w-auto md:flex-[4_1_0%]",
            photos === 2 ? "w-1/2" : "w-full",
          )}
        >
          <Image
            src={left}
            alt=""
            fill
            sizes="(min-width: 768px) 30vw, 50vw"
            className="object-cover"
          />
        </Cell>
      )}
      {right && (
        <Cell
          href={promo.showcaseRightLink}
          className={cn(
            "relative aspect-[4/5] md:w-auto md:flex-[4_1_0%]",
            photos === 2 ? "w-1/2" : "w-full",
          )}
        >
          <Image
            src={right}
            alt=""
            fill
            sizes="(min-width: 768px) 30vw, 50vw"
            className="object-cover"
          />
        </Cell>
      )}
    </section>
  );
}

function Cell({
  href,
  className,
  children,
}: {
  href: string | null;
  className: string;
  children: ReactNode;
}) {
  const cls = cn("block overflow-hidden", className);
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  );
}
