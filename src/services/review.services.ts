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

export async function createReview(payload: {
  productId: string;
  rating: number;
  comment: string;
}) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/reviews`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (res.ok) revalidateTag("reviews", "max");
    return result;
  } catch (error) {
    console.error("Error creating review:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getProductReviews(productId: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/reviews/product/${productId}`, {
      method: "GET",
      next: { tags: ["reviews"] },
    });

    return res.json();
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getMyReviews() {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/reviews/my-reviews`, {
      method: "GET",
      headers,
      next: { tags: ["reviews"] },
    });

    return res.json();
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function deleteReview(id: string) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/reviews/${id}`, {
      method: "DELETE",
      headers,
    });

    const result = await res.json();
    if (res.ok) revalidateTag("reviews", "max");
    return result;
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, message: "Something went wrong" };
  }
}
