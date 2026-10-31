"use client";

import { IProduct } from "@/components/modules/Admin/Product/productColumns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { productToGtmItem, pushEcommerceEvent } from "@/lib/gtm";
import ProductCardOptions from "./ProductCardOptions";

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount =
    product.regularPrice > product.sellPrice
      ? Math.round(
          ((product.regularPrice - product.sellPrice) / product.regularPrice) *
            100,
        )
      : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block h-full"
      onClick={() => pushEcommerceEvent("select_item", [productToGtmItem(product)])}
    >
      <Card className="group relative overflow-hidden rounded-2xl border-none bg-card shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col py-0 gap-0">
        {/* Image Container — bleeds to the card edge for a cleaner, premium look */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted/50 dark:bg-slate-800">
          {product.images && product.images.length > 0 ? (
            <>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Second image fades in on hover */}
              {product.images[1] && (
                <Image
                  src={product.images[1]}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          <ProductCardOptions product={product} />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge className="bg-destructive/90 text-white font-semibold shadow-sm">
                -{discount}%
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge
                variant="secondary"
                className="bg-background/90 backdrop-blur-sm shadow-sm"
              >
                Out of Stock
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug tracking-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-black text-primary leading-none tracking-tight">
              ৳{product.sellPrice.toFixed(2)}
            </span>
            {discount > 0 && (
              <span className="text-xs text-muted-foreground line-through leading-none">
                ৳{product.regularPrice.toFixed(2)}
              </span>
            )}
          </div>

          <Button
            variant="default"
            className="mt-1 w-full text-xs font-bold rounded-xl h-9 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:bg-primary/90"
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
