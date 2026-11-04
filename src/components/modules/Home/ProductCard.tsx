"use client";

import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { productToGtmItem, pushEcommerceEvent } from "@/lib/gtm";
import { cn } from "@/lib/utils";
import ProductCardOptions from "./ProductCardOptions";

// What a card needs; full products and the lighter recommendation rows both fit
export interface IProductCardData {
  id: string;
  name: string;
  slug: string;
  images?: string[];
  sellPrice: number;
  regularPrice?: number;
  stock?: number;
  type?: string;
  attributes?: unknown;
}

const formatPrice = (value: number) =>
  `৳${(Number(value) || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

// The shop's one product card: framed, large photo, centred name and price,
// then a full-width red Buy Now. Sizes and colours show over the photo on
// hover.
export default function ProductCard({
  product,
  className,
  imageSizes = "(min-width: 1024px) 23vw, (min-width: 768px) 30vw, 48vw",
}: {
  product: IProductCardData;
  className?: string;
  imageSizes?: string;
}) {
  const href = `/products/${product.slug}`;
  const regular = product.regularPrice ?? 0;
  const discount =
    regular > product.sellPrice ? Math.round(((regular - product.sellPrice) / regular) * 100) : 0;
  const outOfStock = product.stock === 0;

  return (
    <Link
      href={href}
      onClick={() => pushEcommerceEvent("select_item", [productToGtmItem(product)])}
      className={cn(
        "group flex h-full flex-col border bg-card p-1.5 shadow-sm transition-shadow duration-300 hover:shadow-lg sm:p-2",
        className,
      )}
    >
      <div className="flex h-full flex-col border border-border/70">
        {/* Photo, as big as the card allows */}
        <div className="relative aspect-square w-full overflow-hidden bg-white">
          {product.images?.[0] ? (
            <>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes={imageSizes}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Second photo fades in on hover */}
              {product.images[1] && (
                <Image
                  src={product.images[1]}
                  alt=""
                  fill
                  sizes={imageSizes}
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="size-10 text-muted-foreground/40" />
            </div>
          )}

          {/* Sizes / colours slide up over the photo on hover */}
          <ProductCardOptions product={product} />

          <div className="absolute left-2 top-2 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="rounded-full bg-[#d7141f] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                -{discount}%
              </span>
            )}
            {outOfStock && (
              <span className="rounded-full bg-black/75 px-2 py-0.5 text-[11px] font-semibold text-white">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 px-2 pb-3 pt-3 sm:px-3">
          <h3 className="line-clamp-2 min-h-[2.5em] text-center text-sm font-bold leading-tight text-foreground transition-colors group-hover:text-[#d7141f] sm:text-[15px]">
            {product.name}
          </h3>

          <div className="mt-auto flex flex-col gap-2.5 pt-1">
            <div className="flex flex-wrap items-baseline justify-center gap-x-2">
              <span className="text-base font-extrabold text-foreground sm:text-lg">
                {formatPrice(product.sellPrice)}
              </span>
              {discount > 0 && (
                <span className="text-xs text-muted-foreground line-through sm:text-sm">
                  {formatPrice(regular)}
                </span>
              )}
            </div>
            {/* Full-width red button */}
            <span className="flex h-10 w-full items-center justify-center rounded-md bg-[#d7141f] text-sm font-bold uppercase tracking-wide text-white shadow-sm transition-colors group-hover:bg-[#b5121c]">
              Buy Now
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
