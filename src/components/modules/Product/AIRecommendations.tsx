"use client";

import { getAIRecommendations } from "@/services/ai.services";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  sellPrice: number;
  regularPrice?: number;
  images: string[];
  category?: { name: string };
}

export default function AIRecommendations({
  productId,
}: {
  productId: string;
}) {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      const res = await getAIRecommendations(productId);
      if (res.success && res.data?.length > 0) {
        setProducts(res.data);
      }
      setLoading(false);
    };
    fetchRecommendations();
  }, [productId]);

  if (!loading && products.length === 0) return null;

  return (
    <div className="mt-12 mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#111111] via-[#404040] to-[#d7141f] text-white text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(215,119,9,0.35)] overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shine_3s_infinite]" />
          <Sparkles className="size-3 fill-current" />
          AI Recommended
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          You Might Also Like
        </h3>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted animate-pulse h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => {
            const discount =
              product.regularPrice && product.regularPrice > product.sellPrice
                ? Math.round(
                    ((product.regularPrice - product.sellPrice) /
                      product.regularPrice) *
                      100,
                  )
                : null;

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group rounded-2xl border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <Image
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Second image fades in on hover */}
                  {product.images?.[1] && (
                    <Image
                      src={product.images[1]}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  )}
                  {discount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      -{discount}%
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-bold">
                    {product.category?.name}
                  </p>
                  <p className="font-bold text-sm leading-tight line-clamp-2">
                    {product.name}
                  </p>
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="font-black text-primary">
                      ৳{product.sellPrice.toFixed(0)}
                    </span>
                    {product.regularPrice &&
                      product.regularPrice > product.sellPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          ৳{product.regularPrice.toFixed(0)}
                        </span>
                      )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
