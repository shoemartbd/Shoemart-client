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

export async function getPosProducts(query: string = "") {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const url = `${BASE_API_URL}/pos/products?limit=50${query ? `&searchTerm=${query}` : ""}`;
    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await res.json();
  } catch (error) {
    console.error("Error fetching POS products:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getPosCart() {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/pos/cart`, {
      method: "GET",
      headers,
      cache: "no-store",
      next: { tags: ["pos-cart"] },
    });

    return await res.json();
  } catch (error) {
    console.error("Error fetching POS cart:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function addToPosCart(payload: {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  productVariantId?: string | null;
  combination?: string | null;
  productImage?: string | null;
}) {
  try {
    const headers = await getAuthHeaders();
    if (!headers)
      return { success: false, message: "Unauthorized", code: "UNAUTHORIZED" };

    const res = await fetch(`${BASE_API_URL}/pos/cart`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("pos-cart", "max");
    return result;
  } catch (error) {
    console.error("Error adding to POS cart:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function updatePosCartItemQuantity(id: string, quantity: number) {
  try {
    const headers = await getAuthHeaders();
    if (!headers)
      return { success: false, message: "Unauthorized", code: "UNAUTHORIZED" };

    const res = await fetch(`${BASE_API_URL}/pos/cart/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ quantity }),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("pos-cart", "max");
    return result;
  } catch (error) {
    console.error("Error updating POS cart item:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function removePosCartItem(id: string) {
  try {
    const headers = await getAuthHeaders();
    if (!headers)
      return { success: false, message: "Unauthorized", code: "UNAUTHORIZED" };

    const res = await fetch(`${BASE_API_URL}/pos/cart/${id}`, {
      method: "DELETE",
      headers,
    });

    const result = await res.json();
    if (res.ok) revalidateTag("pos-cart", "max");
    return result;
  } catch (error) {
    console.error("Error removing POS cart item:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function clearPosCart() {
  try {
    const headers = await getAuthHeaders();
    if (!headers)
      return { success: false, message: "Unauthorized", code: "UNAUTHORIZED" };

    const res = await fetch(`${BASE_API_URL}/pos/cart`, {
      method: "DELETE",
      headers,
    });

    const result = await res.json();
    if (res.ok) revalidateTag("pos-cart", "max");
    return result;
  } catch (error) {
    console.error("Error clearing POS cart:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function createPosOrder(payload: any) {
  try {
    const headers = await getAuthHeaders();
    if (!headers)
      return { success: false, message: "Unauthorized", code: "UNAUTHORIZED" };

    const res = await fetch(`${BASE_API_URL}/pos/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok) {
      revalidateTag("pos-cart", "max");
      revalidateTag("pos-orders", "max");
    }
    return result;
  } catch (error) {
    console.error("Error creating POS order:", error);
    return { success: false, message: "Something went wrong" };
  }
}
