"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const getAuthHeaders = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  if (!accessToken) return null;

  return {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
  };
};

export async function createOrder(payload: {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  notes?: string;
  items?: { productId: string; quantity: number }[];
  checkoutSessionToken?: string;
}) {
  try {
    // Not logged in: place it as a guest order (allowed while guest checkout
    // is on in Site Settings)
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_API_URL}/orders${headers ? "" : "/guest"}`, {
      method: "POST",
      headers: headers ?? { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!headers && res.status === 403) {
      return { ...result, code: "LOGIN_REQUIRED" };
    }
    if (res.ok) {
      revalidateTag("cart", "max");
      revalidateTag("orders", "max");
    }
    return result;
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getMyOrders() {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/orders/my-orders`, {
      method: "GET",
      headers,
      next: { tags: ["orders"] },
    });

    return res.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getAllOrders(params?: Record<string, string>) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const query = new URLSearchParams(params).toString();
    const res = await fetch(
      `${BASE_API_URL}/orders${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers,
        next: { tags: ["orders"] },
        cache: "no-store",
      },
    );

    return res.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, message: "Something went wrong" };
  }
}

// Every order matching the list filters (server caps it at `limit`)
export async function exportOrders(params?: Record<string, string>) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const query = new URLSearchParams(params).toString();
    const res = await fetch(
      `${BASE_API_URL}/orders/export${query ? `?${query}` : ""}`,
      { method: "GET", headers, cache: "no-store" },
    );

    return res.json();
  } catch (error) {
    console.error("Error exporting orders:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getOrderById(id: string) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/orders/${id}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return res.json();
  } catch (error) {
    console.error("Error fetching order details:", error);
    return { success: false, message: "Something went wrong" };
  }
}

// Public — powers the guest-safe order-confirmation ("Thank You") page, no auth required
export async function getPublicOrder(id: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/orders/${id}/public`, {
      method: "GET",
      cache: "no-store",
    });

    return res.json();
  } catch (error) {
    console.error("Error fetching public order details:", error);
    return { success: false, message: "Something went wrong" };
  }
}

// Public — order tracking by orderNumber + phone, no auth required
export async function trackOrder(payload: { orderNumber: string; phone: string }) {
  try {
    const res = await fetch(`${BASE_API_URL}/orders/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    return res.json();
  } catch (error) {
    console.error("Error tracking order:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getOrderFraudCheck(id: string) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/orders/${id}/fraud-check`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return res.json();
  } catch (error) {
    console.error("Error fetching courier fraud check:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/orders/${id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("orders", "max");
    return result;
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function updateOrderPaymentStatus(id: string, paymentStatus: string) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/orders/${id}/payment-status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ paymentStatus }),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("orders", "max");
    return result;
  } catch (error) {
    console.error("Error updating order payment status:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function updateOrderDiscount(id: string, discountAmount: number) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/orders/${id}/discount`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ discountAmount }),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("orders", "max");
    return result;
  } catch (error) {
    console.error("Error updating order discount:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function assignCourier(
  id: string,
  provider: "PATHAO" | "STEADFAST" | "REDX",
  // RedX only: the delivery area chosen from RedX's area list
  redxArea?: { id: number; name: string },
) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/orders/${id}/assign-courier`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        provider,
        ...(redxArea && { redxAreaId: redxArea.id, redxAreaName: redxArea.name }),
      }),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("orders", "max");
    return result;
  } catch (error) {
    console.error("Error assigning courier:", error);
    return { success: false, message: "Something went wrong" };
  }
}

// RedX delivery areas for a district (Dhaka, Gazipur, ...)
export async function getRedxAreas(district: string) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized", data: [] };
    const res = await fetch(
      `${BASE_API_URL}/orders/redx-areas?district=${encodeURIComponent(district)}`,
      { headers, cache: "no-store" },
    );
    return res.json();
  } catch (error) {
    console.error("Error fetching RedX areas:", error);
    return { success: false, message: "Could not load RedX areas", data: [] };
  }
}

export async function deleteOrder(id: string) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/orders/${id}`, {
      method: "DELETE",
      headers,
    });

    const result = await res.json();
    if (res.ok) revalidateTag("orders", "max");
    return result;
  } catch (error) {
    console.error("Error deleting order:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function updateOrderItemStatus(itemId: string, status: string) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/orders/items/${itemId}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("orders", "max");
    return result;
  } catch (error) {
    console.error("Error updating order item status:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function updateOrderItem(
  itemId: string,
  payload: {
    status?: string;
    productId?: string;
    productVariantId?: string | null;
    quantity?: number;
  },
) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/orders/items/${itemId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("orders", "max");
    return result;
  } catch (error) {
    console.error("Error updating order item:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export type BulkOrderUpdate =
  | { action: "status"; status: string }
  | { action: "payment"; paymentStatus: string }
  | { action: "courier"; provider: "PATHAO" | "STEADFAST" };

export interface BulkOrderResult {
  succeeded: number;
  failed: { id: string; orderNumber: string; message: string }[];
}

// Status / payment / courier for many selected orders at once
export async function bulkUpdateOrders(orderIds: string[], update: BulkOrderUpdate) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/orders/bulk`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ orderIds, ...update }),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("orders", "max");
    return result as { success: boolean; message: string; data?: BulkOrderResult };
  } catch (error) {
    console.error("Error updating orders in bulk:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function bulkDeleteOrders(orderIds: string[]) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/orders/bulk-delete`, {
      method: "POST",
      headers,
      body: JSON.stringify({ orderIds }),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("orders", "max");
    return result as { success: boolean; message: string; data?: BulkOrderResult };
  } catch (error) {
    console.error("Error deleting orders in bulk:", error);
    return { success: false, message: "Something went wrong" };
  }
}
