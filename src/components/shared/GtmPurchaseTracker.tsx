"use client";

import { useEffect } from "react";
import { IPublicOrder } from "@/types/order.types";
import {
  buildGtmUserData,
  fireOnce,
  GtmItem,
  itemsValue,
  pushEcommerceEvent,
} from "@/lib/gtm";

// GTM `purchase` for the order confirmation page, which every checkout ends
// on (storefront, landing pages, bKash / SSLCommerz returns). Fires once per
// order in this browser, so a refresh or a revisit doesn't count it again.
export default function GtmPurchaseTracker({ order }: { order: IPublicOrder }) {
  useEffect(() => {
    if (order.paymentStatus === "FAILED") return;

    const items: GtmItem[] = order.items
      .map((item) => ({
        item_id: item.product.id,
        item_name: item.product.name,
        item_variant: item.productVariant?.combination,
        price: item.price,
        quantity: item.quantity - item.returnedQuantity,
      }))
      .filter((item) => item.quantity > 0);

    fireOnce(`purchase:${order.id}`, () =>
      pushEcommerceEvent("purchase", items, {
        // GA4 revenue: items after discount; shipping is reported separately
        value: Math.max(0, itemsValue(items) - order.discountAmount),
        userData: buildGtmUserData(order),
        extra: {
          transaction_id: order.orderNumber || order.id,
          shipping: order.shippingFee,
          tax: 0,
          payment_type: order.paymentMethod ?? undefined,
        },
      }),
    );
  }, [order]);

  return null;
}
