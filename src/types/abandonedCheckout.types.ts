export interface IAbandonedCheckoutItem {
  productId: string;
  productVariantId?: string | null;
  name: string;
  variantName?: string | null;
  image?: string | null;
  quantity: number;
  price: number;
}

export type CheckoutSourceValue = "STOREFRONT" | "LANDING_PAGE";

export interface IAbandonedCheckout {
  id: string;
  sessionToken: string;
  source: CheckoutSourceValue;
  landingPageSlug?: string | null;
  fullName?: string | null;
  phone?: string | null;
  address?: string | null;
  district?: string | null;
  notes?: string | null;
  items: IAbandonedCheckoutItem[];
  subtotal?: number | null;
  shippingFee?: number | null;
  discountAmount?: number | null;
  total?: number | null;
  createdAt: string;
  lastActivityAt: string;
}
