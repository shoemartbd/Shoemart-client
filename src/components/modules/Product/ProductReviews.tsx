/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getProductReviews } from "@/services/review.services";
import { useQuery } from "@tanstack/react-query";
import { Star, User } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: reviewResponse, isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => getProductReviews(productId),
  });

  const reviews = reviewResponse?.data ?? [];

  if (isLoading) {
    return (
      <div className="py-8 animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded-lg" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 border-t mt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-foreground uppercase">
            Customer Reviews ({reviews.length})
          </h3>
          <p className="text-muted-foreground text-sm">
            See what others are saying about this product
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-3xl border-2 border-dashed">
          <p className="text-muted-foreground font-medium">
            No reviews yet. Be the first to buy and review!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className="p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted border">
                    {review.user?.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{review.user?.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                &quot;{review.comment}&quot;
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
