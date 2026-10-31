/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IProduct } from "@/components/modules/Admin/Product/productColumns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CategoryRecommendations from "./CategoryRecommendations";
import {
  ShoppingCart,
  Heart,
  Package,
  ShieldCheck,
  Truck,
  RefreshCw,
  Zap,
  Ruler,
  Share2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { useRouter } from "next/navigation";
import ProductReviews from "./ProductReviews";
import { getProductVideoEmbedUrl } from "@/lib/productVideo";
import { productToGtmItem, pushEcommerceEvent } from "@/lib/gtm";

// How much the main image is magnified on hover
const ZOOM = 2.5;

interface ProductDetailsProps {
  product: IProduct;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  // Normalize all image URLs (handle relative paths from local server)
  const formatImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:5000"}/${url}`;
  };

  // Collect product images + variant images (deduplicated)
  const productImages = (product.images || []).map(formatImageUrl).filter(Boolean);
  const variantImages = (product.variants || [])
    .map((v: any) => (v.image ? formatImageUrl(v.image) : null))
    .filter(Boolean) as string[];

  const allImages = Array.from(new Set([...productImages, ...variantImages]));

  console.log("[ProductDetails] product.variants:", product.variants);
  console.log("[ProductDetails] allImages:", allImages);

  const [activeImage, setActiveImage] = useState<string | null>(
    allImages.length > 0 ? allImages[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  // Cursor position over the main image, in %; null when not hovering
  const [zoomAt, setZoomAt] = useState<{ x: number; y: number } | null>(null);
  const [showDescription, setShowDescription] = useState(true);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentVariant, setCurrentVariant] = useState<any>(null);

  // GTM: product page view, once per product
  useEffect(() => {
    pushEcommerceEvent("view_item", [productToGtmItem(product)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  useEffect(() => {
    if (product.type !== "VARIABLE" || !product.attributes || !product.variants) return;

    const attrs = product.attributes as any[];
    const comboArray = attrs.map((attr: any) => selectedOptions[attr.name]);
    const allSelected = comboArray.every((val) => val !== undefined && val !== "");

    if (!allSelected) {
      setCurrentVariant(null);
      return;
    }

    const comboString = comboArray.join("-");
    console.log("[ProductDetails] Looking for combination:", comboString);
    console.log("[ProductDetails] Available variants:", product.variants.map((v: any) => v.combination));

    const matched = (product.variants as any[]).find(
      (v) => v.combination.toLowerCase().trim() === comboString.toLowerCase().trim()
    );

    setCurrentVariant(matched || null);

    if (matched) {
      if (matched.image) {
        setActiveImage(formatImageUrl(matched.image));
      } else {
        // No variant image — fall back to first product image
        setActiveImage(allImages[0] ?? null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptions]);

  const displaySellPrice = currentVariant ? currentVariant.sellPrice : product.sellPrice;
  const displayRegularPrice = currentVariant ? currentVariant.regularPrice : product.regularPrice;
  // NOTE: ProductVariant uses 'quantity' field (not 'stock')
  const displayStock =
    currentVariant != null
      ? (currentVariant.quantity ?? currentVariant.stock ?? 0)
      : product.stock;

  const videoEmbedUrl = getProductVideoEmbedUrl(product.videoUrl);

  const discount =
    displayRegularPrice > displaySellPrice
      ? Math.round(
        ((displayRegularPrice - displaySellPrice) / displayRegularPrice) *
        100,
      )
      : 0;

  const isAddToCartDisabled = displayStock === 0 || (product.type === "VARIABLE" && !currentVariant);

  // Phone share sheet where there is one, otherwise copy the link
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        // Closing the share sheet isn't an error
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const toggleWishlist = () => {
    if (inWishlist) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  return (
    <div className="bg-background pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div
              className={`relative aspect-square w-full rounded-2xl overflow-hidden bg-muted border border-border/50 ${activeImage ? "cursor-zoom-in" : ""}`}
              onMouseMove={(e) => {
                if (!activeImage) return;
                const rect = e.currentTarget.getBoundingClientRect();
                setZoomAt({
                  x: ((e.clientX - rect.left) / rect.width) * 100,
                  y: ((e.clientY - rect.top) / rect.height) * 100,
                });
              }}
              onMouseLeave={() => setZoomAt(null)}
            >
              {activeImage ? (
                <>
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  {/* Hover zoom: the full-size image, magnified and following the cursor */}
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 bg-white bg-no-repeat transition-opacity duration-200 ${zoomAt ? "opacity-100" : "opacity-0"}`}
                    style={{
                      backgroundImage: `url("${activeImage}")`,
                      backgroundSize: `${ZOOM * 100}%`,
                      backgroundPosition: zoomAt ? `${zoomAt.x}% ${zoomAt.y}%` : "center",
                    }}
                  />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive text-white text-base px-3 py-1">
                  {discount}% OFF
                </Badge>
              )}
            </div>

            {allImages.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative aspect-square w-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img
                      ? "border-primary shadow-md"
                      : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">

            <div className="mt-4 mb-2 flex items-start justify-between gap-4">
              <h1 className="min-w-0 text-3xl sm:text-4xl font-extrabold text-foreground">
                {product.name}
              </h1>

              <div className="flex shrink-0 items-center gap-1 pt-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  aria-label="Share"
                  className="gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleWishlist}
                  aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  aria-pressed={inWishlist}
                  className={`gap-1.5 px-2 hover:text-foreground ${inWishlist ? "text-primary" : "text-muted-foreground"}`}
                >
                  <Heart className="h-4 w-4" fill={inWishlist ? "currentColor" : "none"} />
                  <span className="hidden sm:inline">Wishlist</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Badge
                variant="secondary"
                className={
                  displayStock > 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/10 text-destructive dark:text-red-400"
                }
              >
                {displayStock > 0 ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-black text-foreground">
                ৳{displaySellPrice.toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="text-xl text-muted-foreground line-through mb-1">
                  ৳{displayRegularPrice.toFixed(2)}
                </span>
              )}
            </div>


            <div
              className="text-lg text-muted-foreground mb-8 leading-relaxed [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&_li]:marker:text-primary [&>ol]:list-decimal [&>ol]:pl-5 [&>strong]:font-bold [&>a]:text-primary [&>a]:underline"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />


            {/* Variable Product Options */}
            {product.type === "VARIABLE" && product.attributes && (
              <div className="mb-8 space-y-6 border-y py-6">
                {product.attributes.map((attr: any) => (
                  <div key={attr.name} className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                      {attr.name}
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {attr.values.map((val: string) => {
                        const isSelected = selectedOptions[attr.name] === val;
                        return (
                          <button
                            key={val}
                            onClick={() => {
                              const newOptions = { ...selectedOptions, [attr.name]: val };
                              setSelectedOptions(newOptions);
                            }}
                            className={`px-4 py-2 text-sm font-medium rounded-md border transition-all ${isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-md"
                              : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted"
                              }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Shown only when the admin picked a size chart for this product */}
            {product.sizeChart?.image && (
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <Ruler className="h-4 w-4" />
                    View Size Chart
                  </button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Size Chart</DialogTitle>
                    <DialogDescription>{product.sizeChart.name}</DialogDescription>
                  </DialogHeader>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.sizeChart.image}
                    alt={`${product.sizeChart.name} size chart`}
                    className="w-full rounded-lg object-contain"
                  />
                </DialogContent>
              </Dialog>
            )}

            <div className="flex items-center gap-6 mb-8">
              <span className="text-sm font-semibold text-foreground">
                Quantity
              </span>
              <div className="flex items-center border rounded-full overflow-hidden bg-background">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-10 w-10 hover:bg-muted/50 hover:text-primary"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || displayStock === 0}
                >
                  <span className="text-lg font-bold">-</span>
                </Button>
                <div className="w-12 text-center font-bold text-sm">
                  {quantity}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-10 w-10 hover:bg-muted/50 hover:text-primary"
                  onClick={() =>
                    setQuantity((q) => Math.min(displayStock, q + 1))
                  }
                  disabled={quantity >= displayStock || displayStock === 0}
                >
                  <span className="text-lg font-bold">+</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                size="lg"
                className="flex-1 rounded-full text-lg h-14 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                disabled={isAddToCartDisabled}
                onClick={() => addToCart(product, quantity, currentVariant?.id)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                className="flex-1 rounded-full text-lg h-14"
                disabled={isAddToCartDisabled}
                onClick={() => {
                  router.push(
                    `/checkout?productId=${product.id}&quantity=${quantity}&name=${encodeURIComponent(product.name)}&price=${displaySellPrice}&variantId=${currentVariant?.id || ""}&variantName=${currentVariant ? encodeURIComponent(currentVariant.combination) : ""}&image=${encodeURIComponent(activeImage || "")}`,
                  );
                }}
              >
                <Zap className="mr-2 h-5 w-5" />
                Order Now
              </Button>
            </div>

            <Separator className="mb-8" />

            {/* Features/Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-2xl">
                <div className="h-10 w-10 bg-brand-black/10 text-brand-black rounded-full flex items-center justify-center mb-3">
                  <Truck className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">
                  Fast Delivery
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Across the country
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-2xl">
                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 rounded-full flex items-center justify-center mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">
                  Secure Payment
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  100% safe transactions
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-2xl">
                <div className="h-10 w-10 bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 rounded-full flex items-center justify-center mb-3">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-foreground text-sm">
                  Easy Returns
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  7-day return policy
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Separated Bottom Section: Description / Reviews & Recommendations */}
        <div className="mt-16 text-left w-full">
          {/* Description / Reviews Toggle */}
          <div className="mb-6">
            <div className="flex gap-2 mb-6 border-b pb-0">
              <button
                className={`px-6 py-3 font-semibold focus:outline-none transition-colors border-b-2 ${showDescription ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                onClick={() => setShowDescription(true)}
              >
                Description
              </button>
              <button
                className={`px-6 py-3 font-semibold focus:outline-none transition-colors border-b-2 ${!showDescription ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                onClick={() => setShowDescription(false)}
              >
                Reviews
              </button>
            </div>

            {/* Description Content */}
            {showDescription && (
              <div className="mt-4 bg-card text-card-foreground p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
                <h3 className="text-2xl font-bold text-foreground mb-6 tracking-tight">
                  Product Description
                </h3>
                <div
                  className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-1 [&>p]:mb-3 [&>strong]:font-bold"
                  dangerouslySetInnerHTML={{
                    __html:
                      (product as any).description ||
                      product.shortDescription,
                  }}
                />

                {videoEmbedUrl && (
                  <div className="mt-10">
                    <h3 className="text-2xl font-bold text-foreground mb-6 tracking-tight">
                      Product Video
                    </h3>
                    <div className="mx-auto aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-black/5">
                      <iframe
                        src={videoEmbedUrl}
                        title={`${product.name} video`}
                        className="h-full w-full"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Reviews */}
          {!showDescription && (
            <div className="mt-4 bg-card text-card-foreground p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
              <ProductReviews productId={product.id} />
            </div>
          )}

          {/* Category Recommendations */}
          <div className="mt-16">
            {product.category?.id && (
              <CategoryRecommendations
                categoryId={product.category.id}
                currentProductId={product.id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
