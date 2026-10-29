/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "@/services/category.services";
import { Skeleton } from "@/components/ui/skeleton";

// Fixed 4 banners: one row of 4 on desktop, 2 × 2 on phones
const SHOWN = 4;
const GRID = "grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4";

// Category banners under the hero slider.
// The admin's category image is the whole card (title is designed into it),
// so the name only shows when no image was uploaded.
export default function CategorySection() {
  const { data, isLoading } = useQuery({
    // Own key: this asks for every top-level category, not the default 10
    queryKey: ["categories", "home-top-level"],
    queryFn: () => getAllCategories({ limit: "200" }),
    staleTime: 10 * 60 * 1000, // cache for 10 minutes
  });

  // First 4 active top-level categories
  const categories = (
    data?.data?.filter((c: any) => c.isActive !== false && !c.parentId) || []
  ).slice(0, SHOWN);

  if (!isLoading && categories.length === 0) return null;

  return (
    <section aria-label="Categories" className={GRID}>
      {isLoading
        ? [...Array(SHOWN)].map((_, i) => (
            <Skeleton key={i} className="aspect-15/8 w-full rounded-xl" />
          ))
        : categories.map((category: any) => (
            <CategoryBanner key={category.id} category={category} />
          ))}
    </section>
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
