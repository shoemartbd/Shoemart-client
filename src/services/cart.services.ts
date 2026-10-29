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

export async function getCart() {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/cart`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function addToCart(
  productId: string,
  quantity: number = 1,
  productVariantId?: string | null,
) {
  try {
    const headers = await getAuthHeaders();
    if (!headers)
      return { success: false, message: "Unauthorized", code: "UNAUTHORIZED" };

    const res = await fetch(`${BASE_API_URL}/cart/add`, {
      method: "POST",
      headers,
      body: JSON.stringify({ productId, quantity, productVariantId }),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("cart", "max");
    return result;
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function updateCartItemQuantity(
  productId: string,
  quantity: number,
  productVariantId?: string | null,
) {
  try {
    const headers = await getAuthHeaders();
    if (!headers)
      return { success: false, message: "Unauthorized", code: "UNAUTHORIZED" };

    const res = await fetch(`${BASE_API_URL}/cart/update`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ productId, quantity, productVariantId }),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("cart", "max");
    return result;
  } catch (error) {
    console.error("Error updating cart:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function removeFromCart(
  productId: string,
  productVariantId?: string | null,
) {
  try {
    const headers = await getAuthHeaders();
    if (!headers)
      return { success: false, message: "Unauthorized", code: "UNAUTHORIZED" };

    let url = `${BASE_API_URL}/cart/remove/${productId}`;
    if (productVariantId) {
      url += `?productVariantId=${productVariantId}`;
    }

    const res = await fetch(url, {
      method: "DELETE",
      headers,
    });

    const result = await res.json();
    if (res.ok) revalidateTag("cart", "max");
    return result;
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function clearCart() {
  try {
    const headers = await getAuthHeaders();
    if (!headers)
      return { success: false, message: "Unauthorized", code: "UNAUTHORIZED" };

    const res = await fetch(`${BASE_API_URL}/cart/clear`, {
      method: "DELETE",
      headers,
    });

    const result = await res.json();
    if (res.ok) revalidateTag("cart", "max");
    return result;
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, message: "Something went wrong" };
  }
}
