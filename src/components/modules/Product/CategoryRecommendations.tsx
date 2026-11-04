"use client";

import { getAllProducts } from "@/services/product.services";
import { useEffect, useState } from "react";
import { Grid2x2 } from "lucide-react";
import ProductCard from "@/components/modules/Home/ProductCard";

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

export default function CategoryRecommendations({
  categoryId,
  currentProductId,
}: {
  categoryId: string;
  currentProductId: string;
}) {
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!categoryId) return;
      setLoading(true);
      try {
        const res = await getAllProducts({ categoryId, limit: "10", view: "card" });
        if (res.success && res.data?.length > 0) {
          const filtered = res.data.filter((p: any) => p.id !== currentProductId).slice(0, 4);
          setProducts(filtered);
        }
      } catch (error) {
        console.error("Error fetching category recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [categoryId, currentProductId]);

  if (!loading && products.length === 0) return null;

  return (
    <div className="mt-12 mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-black uppercase tracking-widest shadow-md">
          <Grid2x2 className="size-3 fill-current" />
          Related Products
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
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              imageSizes="(max-width: 768px) 50vw, 25vw"
            />
          ))}
        </div>
      )}
    </div>
  );
}
