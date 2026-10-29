"use client";

import { useCart } from "@/providers/CartProvider";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useRef } from "react";
import { cartItemsToGtmItems, pushEcommerceEvent } from "@/lib/gtm";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  // GTM: cart page view, once the cart has loaded
  const cartTracked = useRef(false);
  useEffect(() => {
    if (cartTracked.current || cartItems.length === 0) return;
    cartTracked.current = true;
    pushEcommerceEvent("view_cart", cartItemsToGtmItems(cartItems));
  }, [cartItems]);
  const router = useRouter();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0 && !isInitialized) {
      setSelectedKeys(new Set(cartItems.map((item) => `${item.id}-${item.productVariantId || "base"}`)));
      setIsInitialized(true);
    }
  }, [cartItems, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      const currentKeys = new Set(cartItems.map((item) => `${item.id}-${item.productVariantId || "base"}`));
      setSelectedKeys((prev) => {
        const next = new Set<string>();
        prev.forEach((k) => {
          if (currentKeys.has(k)) next.add(k);
        });
        return next;
      });
    }
  }, [cartItems, isInitialized]);

  const selectedItems = cartItems.filter((item) =>
    selectedKeys.has(`${item.id}-${item.productVariantId || "base"}`)
  );

  const subtotal = selectedItems.reduce(
    (total, item) => total + (item.variant?.sellPrice || item.sellPrice) * item.cartQuantity,
    0,
  );

  const shipping = 0; // Removed shipping estimate price per request
  const total = subtotal;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-primary/5 p-6 rounded-full mb-6">
          <ShoppingBag className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl font-black mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Looks like you haven&apos;t added anything to your cart yet. Discover
          our amazing products and start shopping!
        </p>
        <Button asChild size="lg" className="rounded-full h-12 px-8 font-bold">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 lg:py-20">
      <h1 className="text-3xl lg:text-4xl font-black mb-10 tracking-tight">
        Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="bg-card rounded-3xl p-6 shadow-sm border">
            <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b text-sm font-bold text-muted-foreground uppercase tracking-wider items-center">
              <div className="col-span-6 flex items-center gap-3">
                <Checkbox
                  checked={cartItems.length > 0 && selectedKeys.size === cartItems.length}
                  onCheckedChange={() => {
                    if (selectedKeys.size === cartItems.length) {
                      setSelectedKeys(new Set());
                    } else {
                      setSelectedKeys(new Set(cartItems.map((item) => `${item.id}-${item.productVariantId || "base"}`)));
                    }
                  }}
                />
                <span>Product</span>
              </div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-1 text-right"></div>
            </div>

            <div className="divide-y divide-border">
              {cartItems.map((item) => {
                const itemKey = `${item.id}-${item.productVariantId || "base"}`;
                const isSelected = selectedKeys.has(itemKey);
                return (
                  <div
                    key={itemKey}
                    className={`py-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center transition-colors duration-200 ${isSelected ? "" : "opacity-60"}`}
                  >
                    <div className="col-span-1 sm:col-span-6 flex gap-4 items-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => {
                          setSelectedKeys((prev) => {
                            const next = new Set(prev);
                            if (next.has(itemKey)) {
                              next.delete(itemKey);
                            } else {
                              next.add(itemKey);
                            }
                            return next;
                          });
                        }}
                      />
                      <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border">
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                      <div className="flex flex-col gap-1">
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-bold text-lg hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-muted-foreground bg-muted w-max px-2 py-1 rounded-md">
                          {item.category?.name || "Uncategorized"}
                        </span>
                        {item.variant?.combination && (
                          <span className="text-xs text-primary bg-primary/10 w-max px-2 py-1 rounded-md font-semibold">
                            {item.variant.combination}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 text-center font-bold text-lg">
                    ৳{((item.variant?.sellPrice || item.sellPrice)).toFixed(2)}
                  </div>

                  <div className="col-span-1 sm:col-span-3 flex justify-center">
                    <div className="flex items-center border rounded-full overflow-hidden bg-background">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-none hover:bg-muted/50 hover:text-primary"
                        onClick={() => {
                          if (item.cartQuantity > 1) {
                            updateQuantity(item.id, item.cartQuantity - 1, item.productVariantId);
                          } else {
                            removeFromCart(item.id, item.productVariantId);
                          }
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-10 text-center font-bold text-sm">
                        {item.cartQuantity}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-none hover:bg-muted/50 hover:text-primary"
                        disabled={item.cartQuantity >= item.stock}
                        onClick={() =>
                          updateQuantity(item.id, item.cartQuantity + 1, item.productVariantId)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                      onClick={() => removeFromCart(item.id, item.productVariantId)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[380px]">
          <div className="bg-card rounded-3xl p-8 shadow-sm border sticky top-28">
            <h2 className="text-xl font-black mb-6">Order Summary</h2>

            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">
                  Subtotal
                </span>
                <span className="font-bold">৳{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-between mb-8">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-black text-primary">
                ৳{total.toFixed(2)}
              </span>
            </div>

            <Button
              className="w-full h-14 rounded-full text-lg font-bold group"
              disabled={selectedItems.length === 0}
              onClick={() => {
                const selectedItemsPayload = selectedItems.map((item) => ({
                  id: item.id,
                  name: item.name,
                  sellPrice: item.variant?.sellPrice || item.sellPrice,
                  cartQuantity: item.cartQuantity,
                  productVariantId: item.productVariantId || null,
                  variant: item.variant || null,
                  images: item.images || [],
                }));
                router.push(`/checkout?selectedItems=${encodeURIComponent(JSON.stringify(selectedItemsPayload))}`);
              }}
            >
              Proceed to Checkout ({selectedItems.length})
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="mt-6 text-center">
              <Link
                href="/products"
                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
