"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  Loader2,
  Minus,
  Plus,
  Package,
} from "lucide-react";
import { ILandingPage } from "@/types/landingPage.types";
import { ISiteSetting } from "@/types/siteSetting.types";
import { placeLandingPageOrder } from "@/services/landingPage.services";
import { getPaymentSettings } from "@/services/paymentSetting.services";
import {
  initiateBkashGuestPayment,
  initiateBkashPayment,
} from "@/services/payment.services";
import PaymentMethodPicker, {
  availablePaymentMethods,
  PaymentMethod,
} from "@/components/shared/PaymentMethodPicker";
import { getShippingSettings } from "@/services/shippingSetting.services";
import { trackAbandonedCheckout } from "@/services/abandonedCheckout.services";
import {
  clearCheckoutSessionToken,
  getCheckoutSessionToken,
} from "@/lib/checkoutSession";
import { DHAKA_DISTRICTS, BANGLADESH_DISTRICTS } from "@/lib/districts";
import {
  DEFAULT_LANDING_PAGE_THEME,
  LANDING_PAGE_THEMES,
  LandingPageThemeKey,
} from "@/lib/landingPageThemes";
import { LandingPageSectionKey, resolveSectionOrder } from "@/lib/landingPageSections";
import PriceHighlight from "./PriceHighlight";
import { BD_MOBILE_MESSAGE, getPhoneHint, isValidBdPhone, sanitizePhoneInput } from "@/lib/phone";
import { buildGtmUserData, productToGtmItem, pushEcommerceEvent } from "@/lib/gtm";
import {
  AboutSection,
  DescriptionSection,
  GallerySection,
  proseClass,
  ReviewsSection,
  SectionDivider,
} from "./LandingPageSections";

interface LandingPageViewProps {
  landingPage: ILandingPage;
  siteSettings: ISiteSetting | null;
}

export default function LandingPageView({ landingPage, siteSettings }: LandingPageViewProps) {
  const router = useRouter();
  const product = landingPage.product as any;

  const siteName = siteSettings?.siteName || "Shoe Mart";
  const logo = siteSettings?.logo;

  const theme =
    LANDING_PAGE_THEMES[landingPage.themeColor as LandingPageThemeKey] ??
    LANDING_PAGE_THEMES[DEFAULT_LANDING_PAGE_THEME];
  const themeStyle = {
    "--primary": theme.primary,
    "--primary-foreground": theme.primaryForeground,
  } as React.CSSProperties;

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentVariant, setCurrentVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // COD is always offered and selected by default; bKash when the admin
  // turned it on (SSLCommerz needs an account, so it isn't offered here)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(["COD"]);

  useEffect(() => {
    getPaymentSettings()
      .then((res) =>
        setPaymentMethods(availablePaymentMethods(res.data, { allowSslcommerz: false })),
      )
      .catch(() => undefined);
  }, []);

  const [shippingRates, setShippingRates] = useState({ inside: 70, outside: 130 });

  useEffect(() => {
    getShippingSettings()
      .then((res) => {
        if (res.data) {
          setShippingRates({
            inside: res.data.insideDhakaShippingFee,
            outside: res.data.outsideDhakaShippingFee,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (product?.type !== "VARIABLE" || !product?.attributes?.length || !product?.variants) {
      return;
    }
    const comboArray = product.attributes.map((attr: any) => selectedOptions[attr.name]);
    const allSelected = comboArray.every((v: string) => v !== undefined && v !== "");
    if (!allSelected) {
      setCurrentVariant(null);
      return;
    }
    const comboString = comboArray.join("-");
    const matched = product.variants.find(
      (v: any) => v.combination.toLowerCase().trim() === comboString.toLowerCase().trim(),
    );
    setCurrentVariant(matched || null);
  }, [selectedOptions, product]);

  const isVariable = product?.type === "VARIABLE";
  const sellPrice = currentVariant ? currentVariant.sellPrice : product?.sellPrice ?? 0;
  const regularPrice = currentVariant ? currentVariant.regularPrice : product?.regularPrice ?? 0;
  const stock = currentVariant ? currentVariant.quantity ?? 0 : product?.stock ?? 0;

  const isDhaka = DHAKA_DISTRICTS.includes(district);
  const shippingFee = product?.freeShipping ? 0 : isDhaka ? shippingRates.inside : shippingRates.outside;
  const subtotal = sellPrice * quantity;
  const total = subtotal + shippingFee;

  const canOrder = isVariable ? !!currentVariant : true;
  const outOfStock = stock <= 0;

  const checkoutSessionTokenRef = useRef("");
  const lastSavedSnapshotRef = useRef("");
  useEffect(() => {
    checkoutSessionTokenRef.current = getCheckoutSessionToken();
  }, []);

  // GTM: the landing page is a product page with the order form on it
  const gtmItem = () =>
    productToGtmItem(product, { quantity, variant: currentVariant, price: sellPrice });
  useEffect(() => {
    if (product) pushEcommerceEvent("view_item", [productToGtmItem(product)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landingPage.id]);
  const checkoutTrackedRef = useRef(false);

  // Only worth recording once the customer has started entering contact
  // info — a page visit alone isn't actionable for follow-up
  const saveCheckoutProgress = () => {
    if (!fullName.trim() && !phone.trim() && !address.trim()) return;

    // GTM: checkout starts when the customer begins filling the form
    if (!checkoutTrackedRef.current && product) {
      checkoutTrackedRef.current = true;
      pushEcommerceEvent("begin_checkout", [gtmItem()]);
    }

    const snapshot = {
      sessionToken: checkoutSessionTokenRef.current,
      source: "LANDING_PAGE" as const,
      landingPageSlug: landingPage.slug,
      fullName: fullName.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      district: district || undefined,
      notes: notes.trim() || undefined,
      items: [
        {
          productId: product?.id,
          productVariantId: currentVariant?.id || null,
          name: product?.name,
          variantName: currentVariant?.combination || null,
          image: images?.[0] ?? null,
          quantity,
          price: sellPrice,
        },
      ],
      subtotal,
      shippingFee,
      total,
    };

    const snapshotKey = JSON.stringify(snapshot);
    if (snapshotKey === lastSavedSnapshotRef.current) return;
    lastSavedSnapshotRef.current = snapshotKey;

    void trackAbandonedCheckout(snapshot);
  };

  const saveCheckoutProgressRef = useRef(saveCheckoutProgress);
  saveCheckoutProgressRef.current = saveCheckoutProgress;

  // Safety net for mobile — blur doesn't fire when the user just switches
  // apps or closes the tab, but visibilitychange reliably does
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) saveCheckoutProgressRef.current();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const images = useMemo(() => {
    const list = [...(product?.images || [])];
    if (currentVariant?.image) list.unshift(currentVariant.image);
    return list.filter(Boolean);
  }, [product, currentVariant]);

  const scrollToOrder = () => {
    document.getElementById("order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sectionOrder: LandingPageSectionKey[] = resolveSectionOrder(landingPage.sectionOrder);
  const sectionVisibility: Record<LandingPageSectionKey, boolean> = {
    price: true, // pricing is reorderable but always shown — it's the core conversion driver
    gallery: landingPage.showGallerySection,
    about: landingPage.showAboutSection,
    description: landingPage.showDescriptionSection,
    reviews: landingPage.showReviewsSection,
  };
  const sectionComponents: Record<LandingPageSectionKey, React.ReactNode> = {
    price: (
      <div className="space-y-8">
        <SectionDivider />
        <PriceHighlight
          sellPrice={sellPrice}
          regularPrice={regularPrice}
          buttonText={landingPage.orderButtonText}
          onOrderClick={scrollToOrder}
          regularPriceLabel={landingPage.regularPriceLabel}
          offerPriceLabel={landingPage.offerPriceLabel}
        />
      </div>
    ),
    gallery: <GallerySection landingPage={landingPage} />,
    about: <AboutSection landingPage={landingPage} />,
    description: <DescriptionSection landingPage={landingPage} />,
    reviews: <ReviewsSection landingPage={landingPage} />,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!fullName.trim() || !phone.trim() || !address.trim() || !district) {
      toast.error("Please fill in your name, phone, address and district");
      return;
    }
    if (!isValidBdPhone(phone)) {
      toast.error(BD_MOBILE_MESSAGE);
      return;
    }
    if (isVariable && !currentVariant) {
      toast.error("Please select all product options");
      return;
    }
    if (outOfStock) {
      toast.error("This item is currently out of stock");
      return;
    }

    // GTM: payment step, with the customer's details for Meta matching
    pushEcommerceEvent("add_payment_info", [gtmItem()], {
      userData: buildGtmUserData({ fullName, phone, district }),
      extra: { payment_type: paymentMethod },
    });

    setIsSubmitting(true);
    try {
      const res = await placeLandingPageOrder(landingPage.slug, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        district,
        productVariantId: currentVariant?.id || null,
        quantity,
        shippingFee,
        checkoutSessionToken: checkoutSessionTokenRef.current,
        notes: notes.trim() || undefined,
        paymentMethod: paymentMethod === "BKASH" ? "BKASH" : "COD",
      });

      if (res.success) {
        clearCheckoutSessionToken();
        if (paymentMethod === "BKASH") {
          try {
            // Logged-in customers get the order on their account
            const payRes = await (res.data.userId
              ? initiateBkashPayment
              : initiateBkashGuestPayment)(res.data.id);
            if (payRes.data?.bkashURL) {
              window.location.href = payRes.data.bkashURL;
              return;
            }
            throw new Error("Failed to start bKash payment");
          } catch (payError: any) {
            toast.error(
              payError?.message ||
                "Order placed, but bKash could not be opened. You can pay on delivery.",
            );
          }
        }
        router.push(`/order-confirmation/${res.data.id}`);
      } else {
        toast.error(res.message || "Failed to place order");
        setIsSubmitting(false);
        // Guest checkout is off: log in, then come back to this page
        if ("code" in res && res.code === "LOGIN_REQUIRED") {
          router.push(`/login?redirect=${encodeURIComponent(`/lp/${landingPage.slug}`)}`);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10" style={themeStyle}>
      {/* Minimal header — no site nav, keeps focus on the offer */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-9 w-9 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
              {logo ? (
                <Image src={logo} alt={siteName} fill sizes="36px" className="object-cover" />
              ) : (
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              )}
            </div>
            <span className="font-black text-lg tracking-tight">{siteName}</span>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-14">
        {/* Title */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-serif">
            {landingPage.campaignTitle}
          </h1>
          {landingPage.campaignShortDescription && (
            <div
              className={`text-muted-foreground text-lg max-w-2xl mx-auto ${proseClass}`}
              dangerouslySetInnerHTML={{ __html: landingPage.campaignShortDescription }}
            />
          )}
        </div>

        {/* Banner */}
        {landingPage.bannerImage && (
          <div className="rounded-[2rem] overflow-hidden ring-1 ring-black/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] relative aspect-video w-full">
            <Image
              src={landingPage.bannerImage}
              alt={landingPage.campaignTitle}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 960px"
              className="object-cover"
            />
          </div>
        )}

        {/* Optional content sections — order and visibility are admin-configured */}
        {sectionOrder
          .filter((key) => sectionVisibility[key])
          .map((key) => (
            <Fragment key={key}>{sectionComponents[key]}</Fragment>
          ))}

        {/* Mid-page CTA */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={scrollToOrder}
            className="h-12 px-8 rounded-full font-bold shadow-md"
          >
            {landingPage.orderButtonText}
          </Button>
        </div>

        {/* Order form */}
        <div
          id="order-form"
          className="scroll-mt-20 bg-card ring-1 ring-black/5 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] p-6 md:p-8 space-y-8"
        >
          <div className="text-center space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold font-serif">
              {landingPage.orderFormHeading}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product + options + summary */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="relative h-24 w-24 md:h-32 md:w-32 shrink-0 rounded-xl overflow-hidden border bg-muted">
                  {images[0] ? (
                    <Image src={images[0]} alt={product?.name || ""} fill sizes="(max-width: 768px) 96px, 128px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg leading-tight">{product?.name}</h3>
                  <p className="font-semibold text-muted-foreground">
                    ৳{sellPrice.toFixed(2)}
                    {regularPrice > sellPrice && (
                      <span className="ml-2 text-sm line-through opacity-60">
                        ৳{regularPrice.toFixed(2)}
                      </span>
                    )}
                  </p>
                  {outOfStock && (
                    <span className="inline-block text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {isVariable &&
                product?.attributes?.map((attr: any) => (
                  <div key={attr.name} className="space-y-2">
                    <span className="text-sm font-semibold block">{attr.name}</span>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map((val: string) => {
                        const isSelected = selectedOptions[attr.name] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() =>
                              setSelectedOptions((prev) => ({ ...prev, [attr.name]: val }))
                            }
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:border-primary/50"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              <div className="space-y-2">
                <span className="text-sm font-semibold block">Quantity</span>
                <div className="flex items-center border rounded-full overflow-hidden w-fit">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-10 w-10 flex items-center justify-center hover:bg-muted"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-12 text-center font-bold text-sm">{quantity}</div>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
                    className="h-10 w-10 flex items-center justify-center hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>৳{shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span className="text-primary">৳{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Customer info */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-lg">Your Information</h3>
              <Input
                placeholder="Full Name *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => saveCheckoutProgressRef.current()}
                className="h-12 rounded-xl"
                required
              />
              <div className="space-y-1">
                <Input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="Phone Number * (01XXXXXXXXX)"
                  value={phone}
                  onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                  onBlur={() => saveCheckoutProgressRef.current()}
                  aria-invalid={!!getPhoneHint(phone)}
                  className="h-12 rounded-xl"
                  required
                />
                {getPhoneHint(phone) && (
                  <p className="text-xs font-medium text-destructive">
                    {getPhoneHint(phone)}
                  </p>
                )}
              </div>
              <Textarea
                placeholder="Full Address *"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={() => saveCheckoutProgressRef.current()}
                className="rounded-xl min-h-[80px] resize-none"
                required
              />
              <Select
                value={district}
                onValueChange={(value) => {
                  setDistrict(value);
                  setTimeout(() => saveCheckoutProgressRef.current(), 0);
                }}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select District *" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Order notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => saveCheckoutProgressRef.current()}
                className="rounded-xl min-h-[60px] resize-none"
              />

              <PaymentMethodPicker
                methods={paymentMethods}
                value={paymentMethod}
                onChange={setPaymentMethod}
              />

              <Button
                type="submit"
                disabled={isSubmitting || !canOrder || outOfStock}
                className="w-full h-14 rounded-full text-lg font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                  </>
                ) : paymentMethod === "BKASH" ? (
                  "Pay with bKash"
                ) : (
                  landingPage.orderButtonText
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card border-t p-3 shadow-2xl flex items-center gap-3">
        <div className="flex-1">
          <p className="text-lg font-black text-primary">৳{sellPrice.toFixed(0)}</p>
        </div>
        <Button onClick={scrollToOrder} className="h-12 px-6 rounded-full font-bold flex-1">
          {landingPage.orderButtonText}
        </Button>
      </div>
    </div>
  );
}
