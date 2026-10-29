"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getHomePromo } from "@/services/homePromo.services";

// Wide banner above "All Products", set from Dashboard → Pages → Home.
// Hidden when empty or switched off.
export default function ProductsBanner() {
  const { data: promo } = useQuery({
    queryKey: ["home-promo"],
    queryFn: () => getHomePromo(),
    staleTime: 5 * 60 * 1000,
  });

  const image = promo?.productsBannerEnabled ? promo.productsBannerImage : null;
  if (!image) return null;

  const banner = (
    <div className="relative aspect-[1920/330] w-full overflow-hidden rounded-2xl bg-muted">
      <Image
        src={image}
        alt="Promotion"
        fill
        sizes="(min-width: 1440px) 1376px, 100vw"
        className="object-cover"
      />
    </div>
  );

  return (
    <section aria-label="Promotion">
      {promo?.productsBannerLink ? (
        <Link href={promo.productsBannerLink} className="block">
          {banner}
        </Link>
      ) : (
        banner
      )}
    </section>
  );
}
