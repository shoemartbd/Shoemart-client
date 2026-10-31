"use client";

import { useState } from "react";
import Image from "next/image";

// Hero photo in public/ (square). If it's missing, the first category image
// stands in.
const HERO_IMAGE = "/Wholesale.png";

export default function WholesaleHeroImage({ fallback }: { fallback?: string | null }) {
  const [src, setSrc] = useState(HERO_IMAGE);

  return (
    <div className="relative mx-auto w-full max-w-md lg:ml-auto lg:max-w-lg">
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[#d7141f]/40 via-transparent to-white/10 blur-2xl"
      />
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-[#141414] shadow-2xl">
        <Image
          src={src}
          alt="Shoe Mart wholesale"
          fill
          priority
          sizes="(min-width: 1024px) 512px, 90vw"
          className="object-cover"
          onError={() => {
            if (fallback && src !== fallback) setSrc(fallback);
          }}
        />
      </div>
    </div>
  );
}
