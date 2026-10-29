"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "@/services/product.services";
import ProductCard from "./ProductCard";
import { IProduct } from "@/components/modules/Admin/Product/productColumns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionTitle from "@/components/shared/SectionTitle";

const HOME_PRODUCT_COUNT = 20;

// "All Products" on the homepage: first 20, then "View All" opens the full
// paginated list at /products
export default function HomeProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["homeProducts", HOME_PRODUCT_COUNT],
    queryFn: () => getAllProducts({ limit: String(HOME_PRODUCT_COUNT), view: "card" }),
    staleTime: 10 * 60 * 1000, // cache for 10 minutes
  });

  const products: IProduct[] = data?.data || [];
  const total: number = data?.meta?.total ?? products.length;

  return (
    <section aria-label="All products">
      <div className="flex items-center justify-between gap-4 mb-6">
        <SectionTitle title="All Products" />
        <Link href="/products" className="hidden sm:block shrink-0">
          <Button
            variant="ghost"
            className="font-semibold text-primary hover:bg-primary/5"
          >
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
          <p className="text-muted-foreground text-lg">
            No products available right now. Check back later!
          </p>
        </div>
      )}

      {total > products.length && (
        <div className="mt-10 text-center">
          <Link href="/products">
            <Button size="lg" className="w-full rounded-full px-10 font-bold sm:w-auto">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
