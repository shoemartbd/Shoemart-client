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

export async function getOrderReturns(params?: Record<string, string>) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const query = new URLSearchParams(params).toString();
    const res = await fetch(
      `${BASE_API_URL}/order-returns${query ? `?${query}` : ""}`,
      {
        method: "GET",
        headers,
        next: { tags: ["order-returns"] },
        cache: "no-store",
      },
    );

    return res.json();
  } catch (error) {
    console.error("Error fetching order returns:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getReturnsByOrder(orderId: string) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/order-returns/order/${orderId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return res.json();
  } catch (error) {
    console.error("Error fetching returns for order:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function processOrderReturn(payload: {
  orderId: string;
  items: { orderItemId: string; quantity: number }[];
}) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/order-returns`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok) {
      revalidateTag("orders", "max");
      revalidateTag("order-returns", "max");
    }
    return result;
  } catch (error) {
    console.error("Error processing order return:", error);
    return { success: false, message: "Something went wrong" };
  }
}
