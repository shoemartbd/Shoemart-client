"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { stripHtml } from "@/lib/utils";
import { useWishlist } from "@/providers/WishlistProvider";

// Saved products in a side sheet; `children` is the trigger button
export default function WishlistSheet({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { wishlistCount, wishlistItems, removeFromWishlist } = useWishlist();

  const openProduct = (slug: string) => {
    setOpen(false);
    router.push(`/products/${slug}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b pb-4 mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            My Wishlist ({wishlistCount})
          </SheetTitle>
          <SheetDescription>Products you have saved for later.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
              <Heart className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium text-foreground">Your wishlist is empty</p>
              <p className="text-sm mt-1">Save items you love to find them easily later.</p>
              <Button
                className="mt-6"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  router.push("/products");
                }}
              >
                Explore Products
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {wishlistItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-xl border bg-card hover:border-primary/30 transition-colors">
                  <button
                    type="button"
                    className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0"
                    onClick={() => openProduct(item.slug)}
                  >
                    {item.images?.[0] ? (
                      <Image src={item.images[0]} alt={item.name} fill sizes="80px" className="object-cover" />
                    ) : (
                      <ShoppingBag className="h-8 w-8 m-auto opacity-20" />
                    )}
                  </button>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <button
                        type="button"
                        className="text-left font-semibold text-sm line-clamp-2 hover:text-primary"
                        onClick={() => openProduct(item.slug)}
                      >
                        {item.name}
                      </button>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{stripHtml(item.shortDescription)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary">৳{item.sellPrice?.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeFromWishlist(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
