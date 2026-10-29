/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCart } from "@/providers/CartProvider";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createOrder } from "@/services/order.services";
import { validateCouponCode } from "@/services/coupon.services";
import { getShippingSettings } from "@/services/shippingSetting.services";
import { getPaymentSettings } from "@/services/paymentSetting.services";
import {
  initiateBkashGuestPayment,
  initiateBkashPayment,
  initiateSslcommerzGuestPayment,
  initiateSslcommerzPayment,
} from "@/services/payment.services";
import PaymentMethodPicker, {
  availablePaymentMethods,
  PaymentMethod,
} from "@/components/shared/PaymentMethodPicker";
import { trackAbandonedCheckout } from "@/services/abandonedCheckout.services";
import {
  clearCheckoutSessionToken,
  getCheckoutSessionToken,
} from "@/lib/checkoutSession";
import {
  ArrowRight,
  Loader2,
  Tag,
  X,
  Ticket,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DHAKA_DISTRICTS, BANGLADESH_DISTRICTS } from "@/lib/districts";
import { BD_MOBILE_MESSAGE, getPhoneHint, isValidBdPhone, sanitizePhoneInput } from "@/lib/phone";
import { buildGtmUserData, cartItemsToGtmItems, pushEcommerceEvent } from "@/lib/gtm";

interface AppliedCoupon {
  couponId: string;
  code: string;
  discountAmount: number;
  discountType: string;
}

function CheckoutContent() {
  const { cartItems, clearCart, refreshCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [shippingRates, setShippingRates] = useState({
    inside_dhaka: 70,
    outside_dhaka: 130,
  });

  // Fetch Shipping Settings
  useEffect(() => {
    const fetchShippingSettings = async () => {
      try {
        const res = await getShippingSettings();
        if (res.data) {
          setShippingRates({
            inside_dhaka: res.data.insideDhakaShippingFee,
            outside_dhaka: res.data.outsideDhakaShippingFee,
          });
        }
      } catch (error) {
        console.error("Failed to load dynamic shipping settings", error);
      }
    };
    fetchShippingSettings();
  }, []);

  // Payment method — COD is always offered and selected by default; online
  // methods appear only when the admin turned them on
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(["COD"]);

  useEffect(() => {
    getPaymentSettings()
      .then((res) => setPaymentMethods(availablePaymentMethods(res.data)))
      .catch(() => setPaymentMethods(["COD"]));
  }, []);

  // Contact fields — controlled so blur-based abandoned-checkout autosave can
  // read them, in addition to what FormData already gives us on submit
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const checkoutSessionTokenRef = useRef("");
  const lastSavedSnapshotRef = useRef("");
  useEffect(() => {
    checkoutSessionTokenRef.current = getCheckoutSessionToken();
  }, []);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Checkout Items State
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [isFromCartSelection, setIsFromCartSelection] = useState(false);
  const [isDirectBuy, setIsDirectBuy] = useState(false);

  useEffect(() => {
    // 1. Direct Buy Check
    const productId = searchParams.get("productId");
    const quantity = searchParams.get("quantity");
    const name = searchParams.get("name");
    const price = searchParams.get("price");
    const variantId = searchParams.get("variantId") || undefined;
    const variantName = searchParams.get("variantName") || undefined;
    const image = searchParams.get("image") || undefined;

    if (productId && quantity && name && price) {
      setCheckoutItems([
        {
          id: productId,
          name: name,
          sellPrice: Number(price),
          cartQuantity: Number(quantity),
          productVariantId: variantId || null,
          variant: variantId ? { id: variantId, combination: variantName, sellPrice: Number(price) } : null,
          images: image ? [decodeURIComponent(image)] : [],
        },
      ]);
      setIsDirectBuy(true);
      return;
    }

    // 2. Selected Items from Cart Check
    const selectedItemsParam = searchParams.get("selectedItems");
    if (selectedItemsParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(selectedItemsParam));
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCheckoutItems(parsed);
          setIsFromCartSelection(true);
          return;
        }
      } catch (e) {
        console.error("Failed to parse selected items", e);
      }
    }

    // 3. Fallback to entire cart
    if (cartItems.length > 0) {
      setCheckoutItems(cartItems);
    }
  }, [searchParams, cartItems]);

  const [shippingZone, setShippingZone] = useState<"inside_dhaka" | "outside_dhaka">("inside_dhaka");

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    if (DHAKA_DISTRICTS.includes(district)) {
      setShippingZone("inside_dhaka");
    } else {
      setShippingZone("outside_dhaka");
    }
    // District is set immediately (no blur event on a Select), so save right away
    setTimeout(() => saveCheckoutProgressRef.current(), 0);
  };

  const subtotal = checkoutItems.reduce(
    (total, item) => total + (item.variant?.sellPrice || item.sellPrice) * item.cartQuantity,
    0,
  );

  const shipping = shippingRates[shippingZone];
  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);

  // GTM: checkout started, once the items are known
  const checkoutTrackedRef = useRef(false);
  useEffect(() => {
    if (checkoutTrackedRef.current || checkoutItems.length === 0) return;
    checkoutTrackedRef.current = true;
    pushEcommerceEvent("begin_checkout", cartItemsToGtmItems(checkoutItems));
  }, [checkoutItems]);

  // GTM: shipping step done when a district is first picked
  const shippingTrackedRef = useRef(false);
  useEffect(() => {
    if (shippingTrackedRef.current || !selectedDistrict || checkoutItems.length === 0) return;
    shippingTrackedRef.current = true;
    pushEcommerceEvent("add_shipping_info", cartItemsToGtmItems(checkoutItems), {
      extra: {
        shipping_tier: shippingZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka",
      },
    });
  }, [selectedDistrict, checkoutItems, shippingZone]);

  // Abandoned-checkout autosave — only worth recording once the customer has
  // started entering contact info (an items-only visit isn't actionable for
  // follow-up). Skips the call entirely if nothing changed since last save.
  const saveCheckoutProgress = () => {
    if (!fullName.trim() && !phone.trim() && !address.trim()) return;
    if (checkoutItems.length === 0) return;

    const snapshot = {
      sessionToken: checkoutSessionTokenRef.current,
      source: "STOREFRONT" as const,
      fullName: fullName.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      district: selectedDistrict || undefined,
      notes: notes.trim() || undefined,
      items: checkoutItems.map((item) => ({
        productId: item.id,
        productVariantId: item.productVariantId || null,
        name: item.name,
        variantName: item.variant?.combination || item.variantName || null,
        image: item.images?.[0] ?? item.image ?? null,
        quantity: item.cartQuantity,
        price: item.variant?.sellPrice || item.sellPrice,
      })),
      subtotal,
      shippingFee: shipping,
      discountAmount: discount,
      total,
    };

    const snapshotKey = JSON.stringify(snapshot);
    if (snapshotKey === lastSavedSnapshotRef.current) return;
    lastSavedSnapshotRef.current = snapshotKey;

    void trackAbandonedCheckout(snapshot);
  };

  // Always call the latest closure without re-attaching the listener every render
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

  // Build items array for coupon validation
  const getCouponItems = () => {
    return checkoutItems.map((item) => ({
      productId: item.id,
      price: item.variant?.sellPrice || item.sellPrice,
      quantity: item.cartQuantity,
    }));
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsCouponLoading(true);
    try {
      const result = await validateCouponCode({ code, items: getCouponItems() });
      if (result.success && result.data) {
        setAppliedCoupon(result.data);
        toast.success(
          `Coupon applied! You save ৳${result.data.discountAmount.toFixed(2)}`
        );
        setCouponCode("");
      } else {
        toast.error(result.message || "Invalid coupon code");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to apply coupon";
      toast.error(message);
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (checkoutItems.length === 0) {
      toast.error("You have no items to checkout");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const payload: any = {
      fullName: formData.get("fullName") as string,
      phone,
      email: (formData.get("email") as string)?.trim() || undefined,
      district: selectedDistrict,
      address: formData.get("address") as string,
      notes: formData.get("notes") as string,
    };

    if (!selectedDistrict) {
      toast.error("Please select your district");
      return;
    }

    if (!isValidBdPhone(phone)) {
      toast.error(BD_MOBILE_MESSAGE);
      return;
    }

    // Always pass items to createOrder (this deletes them from cart if they exist)
    payload.items = checkoutItems.map((item) => ({
      productId: item.id,
      quantity: item.cartQuantity,
      productVariantId: item.productVariantId || undefined,
    }));

    if (appliedCoupon) {
      payload.couponId = appliedCoupon.couponId;
      payload.discountAmount = appliedCoupon.discountAmount;
    }

    payload.shippingFee = shipping;
    payload.checkoutSessionToken = checkoutSessionTokenRef.current;
    payload.paymentMethod = paymentMethod;

    // GTM: payment step, with the customer's details for Meta matching
    pushEcommerceEvent("add_payment_info", cartItemsToGtmItems(checkoutItems), {
      value: Math.max(0, subtotal - discount),
      userData: buildGtmUserData({ fullName, phone, email, district: selectedDistrict }),
      extra: { payment_type: paymentMethod, coupon: appliedCoupon?.code },
    });

    setIsLoading(true);
    try {
      const res = await createOrder(payload);
      if (!res.success) {
        toast.error(res.message || "Failed to place order");
        setIsLoading(false);
        // Guest checkout is off: log in, then come back to this checkout
        if (res.code === "LOGIN_REQUIRED") {
          const query = searchParams.toString();
          router.push(
            `/login?redirect=${encodeURIComponent(`/checkout${query ? `?${query}` : ""}`)}`,
          );
        }
        return;
      }

      const isGuestOrder = !res.data.userId;

      clearCheckoutSessionToken();
      if (!isDirectBuy && !isFromCartSelection) {
        clearCart();
      } else {
        // Refresh client-side cart provider since selected/direct items are now deleted from database
        refreshCart?.();
      }

      if (paymentMethod === "SSLCOMMERZ" || paymentMethod === "BKASH") {
        try {
          // Hand over to the gateway; it sends the customer back to the
          // confirmation (paid) or payment-failed page
          const gatewayURL =
            paymentMethod === "BKASH"
              ? (
                  await (isGuestOrder ? initiateBkashGuestPayment : initiateBkashPayment)(
                    res.data.id,
                  )
                ).data?.bkashURL
              : (
                  await (isGuestOrder
                    ? initiateSslcommerzGuestPayment
                    : initiateSslcommerzPayment)(res.data.id)
                ).data?.gatewayPageURL;
          if (gatewayURL) {
            window.location.href = gatewayURL;
            return;
          }
          throw new Error("Failed to start payment");
        } catch (payError: any) {
          toast.error(
            payError?.message ||
              "Order placed, but starting the payment failed. Please contact support.",
          );
          router.push(`/order-confirmation/${res.data.id}`);
          return;
        }
      }

      router.push(`/order-confirmation/${res.data.id}`);
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-black mb-4">Checkout</h1>
        <p className="text-muted-foreground mb-8">
          You have no items to checkout.
        </p>
        <Button asChild onClick={() => router.push("/products")}>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <h1 className="text-3xl lg:text-4xl font-black mb-6 tracking-tight">
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Form */}
        <div className="flex-1">
          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border">
            <h2 className="text-xl font-bold mb-6">Shipping Information</h2>

            <form
              id="checkout-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => saveCheckoutProgressRef.current()}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                    onBlur={() => saveCheckoutProgressRef.current()}
                    required
                    aria-invalid={!!getPhoneHint(phone)}
                    className="h-12 rounded-xl"
                  />
                  {getPhoneHint(phone) && (
                    <p className="text-xs font-medium text-destructive">
                      {getPhoneHint(phone)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address (Optional)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district" className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  District <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedDistrict}
                  onValueChange={handleDistrictChange}
                  required
                >
                  <SelectTrigger
                    id="district"
                    className="h-12 w-full rounded-xl"
                  >
                    <SelectValue placeholder="Select your district" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {BANGLADESH_DISTRICTS.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedDistrict && (
                  <p className="text-xs font-medium text-primary">
                    Please select a district to calculate shipping
                  </p>
                )}
              </div>

              {/* Shipping Zone Selector */}
              <div className="space-y-3">
                <Label className="font-semibold">Shipping Zone</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShippingZone("inside_dhaka")}
                    className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all ${shippingZone === "inside_dhaka"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card hover:border-primary/40"
                      }`}
                  >
                    <span className="font-bold text-sm">Inside Dhaka</span>
                    <span className="text-2xl font-black mt-1">৳{shippingRates.inside_dhaka}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">Dhaka city area</span>
                    {shippingZone === "inside_dhaka" && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShippingZone("outside_dhaka")}
                    className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all ${shippingZone === "outside_dhaka"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card hover:border-primary/40"
                      }`}
                  >
                    <span className="font-bold text-sm">Outside Dhaka</span>
                    <span className="text-2xl font-black mt-1">৳{shippingRates.outside_dhaka}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">All other districts</span>
                    {shippingZone === "outside_dhaka" && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="House No, Road No, Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => saveCheckoutProgressRef.current()}
                  required
                  className="rounded-xl min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any special instructions for delivery..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => saveCheckoutProgressRef.current()}
                  className="rounded-xl min-h-[100px] resize-none"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary & Payment */}
        <div className="w-full lg:w-[420px] lg:flex-shrink-0">
          <div
            className="bg-card rounded-3xl shadow-sm border lg:sticky lg:top-22 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
            data-lenis-prevent
          >
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-black">Your Order</h2>

              {/* Product List with images */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {checkoutItems.map((item) => {
                  const img = item.images?.[0] ?? item.image ?? null;
                  const price = (item.variant?.sellPrice || item.sellPrice) * item.cartQuantity;
                  return (
                    <div
                      key={`${item.id}-${item.productVariantId || "base"}`}
                      className="flex items-center gap-3 text-sm"
                    >
                      {img ? (
                        <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden border bg-muted">
                          <Image
                            src={img}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-muted flex items-center justify-center border text-muted-foreground text-xs">
                          No img
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold line-clamp-1">{item.name}</p>
                        {(item.variant?.combination || item.variantName) && (
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {item.variant?.combination || item.variantName}
                          </span>
                        )}
                        <p className="text-muted-foreground text-xs mt-0.5">Qty: {item.cartQuantity}</p>
                      </div>
                      <div className="font-bold shrink-0">
                        ৳{price.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Coupon Section */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-primary">{appliedCoupon.code}</p>
                      <p className="text-xs text-muted-foreground">
                        Save ৳{appliedCoupon.discountAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-primary" />
                    Have a Coupon?
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="h-10 rounded-xl uppercase tracking-wider font-mono text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleApplyCoupon();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 px-4 rounded-xl font-semibold shrink-0"
                      disabled={isCouponLoading || !couponCode.trim()}
                      onClick={handleApplyCoupon}
                    >
                      {isCouponLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              {/* Price Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-bold">৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">
                    Shipping ({shippingZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})
                  </span>
                  <span className="font-bold">৳{shipping.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-primary">
                    <span className="font-medium flex items-center gap-1">
                      <Ticket className="h-3.5 w-3.5" />
                      Coupon ({appliedCoupon.code})
                    </span>
                    <span className="font-bold">-৳{appliedCoupon.discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-black text-primary">
                  ৳{total.toFixed(2)}
                </span>
              </div>

              {appliedCoupon && (
                <Badge className="w-full justify-center py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">
                  🎉 You are saving ৳{appliedCoupon.discountAmount.toFixed(2)} with coupon {appliedCoupon.code}
                </Badge>
              )}

              <div className="space-y-2">
                <Label className="font-semibold">Payment Method</Label>
                <PaymentMethodPicker
                  methods={paymentMethods}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />
              </div>

              <Button
                type="submit"
                form="checkout-form"
                className="w-full h-12 rounded-full text-lg font-bold group"
                disabled={isLoading}
              >
                {isLoading
                  ? "Processing..."
                  : paymentMethod === "BKASH"
                    ? "Pay with bKash"
                    : paymentMethod === "SSLCOMMERZ"
                      ? "Pay & Place Order"
                      : "Place Order"}
                {!isLoading && (
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
            </div> {/* end inner p-8 wrapper */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
