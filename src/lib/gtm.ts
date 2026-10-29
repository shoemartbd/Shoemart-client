// Google Tag Manager dataLayer helpers. Event names and shapes follow the GA4
// e-commerce schema, which the GTM web container template listens for
// (CE - view_item, CE - add_to_cart, ... CE - purchase).
//
// Every call is a no-op on the server, and safe when GTM is switched off:
// pushes simply sit in window.dataLayer with nothing reading them.

/* eslint-disable @typescript-eslint/no-explicit-any */

export const GTM_CURRENCY = "BDT";

export interface GtmItem {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  item_list_name?: string;
  index?: number;
  price: number;
  quantity: number;
}

// Customer details for Meta Advanced Matching / CAPI. Sent raw; the Meta tags
// hash them before they leave the browser and the server container.
export interface GtmUserData {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const push = (data: Record<string, unknown>) => {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
};

// Drops empty fields, so GTM variables read "undefined" instead of ""
const compact = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ) as T;

const round = (n: number) => Math.round(n * 100) / 100;

export const itemsValue = (items: GtmItem[]) =>
  round(items.reduce((sum, i) => sum + i.price * i.quantity, 0));

/** Plain event, e.g. search / login / sign_up. */
export const pushGtmEvent = (event: string, data: Record<string, unknown> = {}) => {
  push({ event, ...data });
};

/**
 * GA4 e-commerce event. Clears the previous `ecommerce` object first, as GTM
 * merges dataLayer pushes and old items would otherwise leak into this event.
 */
export const pushEcommerceEvent = (
  event: string,
  items: GtmItem[],
  options: {
    value?: number;
    userData?: GtmUserData;
    extra?: Record<string, unknown>; // transaction_id, shipping, coupon, payment_type ...
  } = {},
) => {
  if (items.length === 0) return;
  push({ ecommerce: null, user_data: null });
  push({
    event,
    ecommerce: compact({
      currency: GTM_CURRENCY,
      value: round(options.value ?? itemsValue(items)),
      ...options.extra,
      items: items.map((item) => compact({ ...item })),
    }),
    ...(options.userData && { user_data: compact({ ...options.userData }) }),
  });
};

/** Product (+ optional variant) from the storefront API as a GA4 item. */
export const productToGtmItem = (
  product: any,
  options: {
    quantity?: number;
    variant?: any;
    price?: number;
    index?: number;
    listName?: string;
  } = {},
): GtmItem => {
  const variant = options.variant;
  return compact({
    item_id: String(product?.id ?? ""),
    item_name: String(product?.name ?? ""),
    item_brand: product?.brand?.name,
    item_category: product?.category?.name,
    item_variant: variant?.combination,
    item_list_name: options.listName,
    index: options.index,
    price: Number(
      options.price ?? variant?.sellPrice ?? product?.sellPrice ?? 0,
    ),
    quantity: options.quantity ?? 1,
  });
};

/** Cart / checkout rows (product fields + cartQuantity + variant). */
export const cartItemsToGtmItems = (cartItems: any[]): GtmItem[] =>
  cartItems.map((item) =>
    productToGtmItem(item, {
      quantity: Number(item.cartQuantity ?? item.quantity ?? 1),
      variant: item.variant,
    }),
  );

// 01712345678 -> +8801712345678 (E.164, what Meta matches best)
const toE164 = (phone?: string | null) => {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("880")) return `+${digits}`;
  if (digits.startsWith("0")) return `+88${digits}`;
  return `+${digits}`;
};

/** Checkout / order details as user_data. District is the closest to a city. */
export const buildGtmUserData = (details: {
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  district?: string | null;
}): GtmUserData => {
  const [firstName, ...rest] = (details.fullName ?? "").trim().split(/\s+/);
  return compact({
    email: details.email?.trim().toLowerCase() || undefined,
    phone: toE164(details.phone),
    first_name: firstName || undefined,
    last_name: rest.join(" ") || undefined,
    city: details.district?.trim() || undefined,
    state: details.district?.trim() || undefined,
    country: "BD",
  });
};

/**
 * Runs `fire` only the first time for this key in this browser, so a refresh
 * of the order confirmation page doesn't count the purchase twice.
 */
export const fireOnce = (key: string, fire: () => void) => {
  const storageKey = `gtm-fired:${key}`;
  try {
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, "1");
  } catch {
    // Storage blocked: still fire once for this page view
  }
  fire();
};
