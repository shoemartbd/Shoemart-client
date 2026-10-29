"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { IAbandonedCheckoutItem } from "@/types/abandonedCheckout.types";

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

// Public, fire-and-forget autosave — called as the customer fills in the
// checkout form. Never throws: a failed save should never block checkout.
export async function trackAbandonedCheckout(payload: {
  sessionToken: string;
  source?: "STOREFRONT" | "LANDING_PAGE";
  landingPageSlug?: string | null;
  fullName?: string;
  phone?: string;
  address?: string;
  district?: string;
  notes?: string;
  items?: IAbandonedCheckoutItem[];
  subtotal?: number;
  shippingFee?: number;
  discountAmount?: number;
  total?: number;
}) {
  try {
    await fetch(`${BASE_API_URL}/abandoned-checkouts/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error saving abandoned checkout progress:", error);
  }
}

export async function getAbandonedCheckouts(params?: Record<string, string>) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const query = new URLSearchParams(params).toString();
    const res = await fetch(
      `${BASE_API_URL}/abandoned-checkouts${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers,
        next: { tags: ["abandoned-checkouts"] },
        cache: "no-store",
      },
    );

    return res.json();
  } catch (error) {
    console.error("Error fetching abandoned checkouts:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function deleteAbandonedCheckout(id: string) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/abandoned-checkouts/${id}`, {
      method: "DELETE",
      headers,
    });

    const result = await res.json();
    if (res.ok) revalidateTag("abandoned-checkouts", "max");
    return result;
  } catch (error) {
    console.error("Error deleting abandoned checkout:", error);
    return { success: false, message: "Something went wrong" };
  }
}
