"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getBrands } from "@/services/brand.services";

// Brand logos scrolling right-to-left in an endless loop. The list is rendered
// twice back to back and the track slides by exactly half its width, so the
// second copy lands where the first began and the loop has no visible seam.
// Hovering pauses it.
export default function BrandMarquee() {
  const { data: brands = [] } = useQuery({
    queryKey: ["brands", "public"],
    queryFn: () => getBrands(),
    staleTime: 10 * 60 * 1000,
  });

  if (brands.length === 0) return null;

  // Repeat short lists so one copy is wider than the screen
  const minItems = 10;
  const repeats = Math.max(1, Math.ceil(minItems / brands.length));
  const oneCopy = Array.from({ length: repeats }, () => brands).flat();
  // Speed stays even: roughly 3s per logo
  const duration = `${oneCopy.length * 3}s`;

  return (
    <section
      aria-label="Our brands"
      className="group relative overflow-hidden rounded-2xl border bg-card py-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
    >
      <div
        className="flex w-max animate-[brand-marquee_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: duration }}
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex shrink-0 items-center gap-4 pr-4 md:gap-6 md:pr-6"
            aria-hidden={copy === 1}
          >
            {oneCopy.map((brand, i) => (
              <li key={`${copy}-${brand.id}-${i}`}>
                <Link
                  href={`/products?brandId=${brand.id}`}
                  tabIndex={copy === 1 ? -1 : undefined}
                  title={brand.name}
                  className="flex aspect-square w-20 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-black/5 transition-all hover:shadow-md hover:ring-primary/40 md:w-28"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    width={96}
                    height={96}
                    loading="lazy"
                    className="h-auto w-auto max-h-full max-w-full object-contain"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
