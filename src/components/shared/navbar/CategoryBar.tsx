"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { getStorefrontCategories } from "@/services/category.services";
import { ICategory } from "@/types/category.types";

const categoryHref = (id: string) => `/products?categoryId=${id}`;

// Strip under the header: top-level categories, subcategories in a dropdown
// on hover (desktop). Phones get a sideways-scrolling row of the same links.
export default function CategoryBar() {
  const { data } = useQuery({
    // Same request as the homepage category banners, so it's shared
    queryKey: ["categories", "storefront"],
    queryFn: () => getStorefrontCategories(),
    staleTime: 10 * 60 * 1000,
  });

  const categories = ((data?.data ?? []) as ICategory[]).filter(
    (c) => c.isActive !== false && !c.parentId,
  );
  if (categories.length === 0) return null;

  return (
    <nav aria-label="Categories" className="border-b bg-background">
      <ul className="container mx-auto flex h-12 items-stretch gap-1 overflow-x-auto px-4 [scrollbar-width:none] md:px-8 lg:justify-center lg:gap-8 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => {
          const subs = (category.subcategories ?? []).filter((s) => s.isActive !== false);
          return (
            <li key={category.id} className="group relative flex shrink-0 items-stretch">
              <Link
                href={categoryHref(category.id)}
                className="flex items-center gap-1 whitespace-nowrap px-2 text-sm font-medium uppercase tracking-wide text-foreground transition-colors hover:text-brand-red lg:text-[15px]"
              >
                {category.name}
                {subs.length > 0 && (
                  <ChevronDown className="hidden size-4 transition-transform group-hover:rotate-180 lg:block" />
                )}
              </Link>

              {subs.length > 0 && (
                <div className="invisible absolute left-1/2 top-full z-50 hidden -translate-x-1/2 pt-px opacity-0 transition-all duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 lg:block">
                  <ul className="min-w-52 rounded-b-lg border bg-popover py-2 text-popover-foreground shadow-lg">
                    <li>
                      <Link
                        href={categoryHref(category.id)}
                        className="block px-4 py-2 text-sm font-semibold hover:bg-muted hover:text-brand-red"
                      >
                        All {category.name}
                      </Link>
                    </li>
                    {subs.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={categoryHref(sub.id)}
                          className="block px-4 py-2 text-sm hover:bg-muted hover:text-brand-red"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
