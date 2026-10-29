"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export async function createProduct(payload: FormData) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return { success: false, message: "Unauthorized" };
    }

    const res = await fetch(`${BASE_API_URL}/products`, {
      method: "POST",
      headers: {
        Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
      },
      body: payload,
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Failed to create product",
      };
    }

    revalidateTag("products", "max");

    return { success: true, data: result.data, message: result.message };
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function generateProductSku() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return { success: false, message: "Unauthorized" };
    }

    const res = await fetch(`${BASE_API_URL}/products/generate-sku`, {
      method: "GET",
      headers: {
        Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
      },
      cache: "no-store",
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Failed to generate SKU",
      };
    }

    return { success: true, data: result.data, message: result.message };
  } catch (error: unknown) {
    console.error("Error generating SKU:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getAllProducts(queryParams?: Record<string, string>) {
  try {
    const url = new URL(`${BASE_API_URL}/products`);

    if (queryParams) {
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key]) {
          url.searchParams.append(key, queryParams[key]);
        }
      });
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function updateProduct(id: string, payload: FormData) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return { success: false, message: "Unauthorized" };
    }

    const res = await fetch(`${BASE_API_URL}/products/${id}`, {
      method: "PATCH",
      headers: {
        Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
      },
      body: payload,
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Failed to update product",
      };
    }

    revalidateTag("products", "max");

    return { success: true, data: result.data, message: result.message };
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function deleteProduct(id: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return { success: false, message: "Unauthorized" };
    }

    const res = await fetch(`${BASE_API_URL}/products/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
      },
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Failed to delete product",
      };
    }

    revalidateTag("products", "max");

    return { success: true, data: result.data, message: result.message };
  } catch (error: unknown) {
    console.error("Error deleting product:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getProductById(id: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/products/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error(`Error fetching product by id (${id}):`, error);
    throw error;
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const res = await fetch(`${BASE_API_URL}/products/slug/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error(`Error fetching product by slug (${slug}):`, error);
    throw error;
  }
}

export async function uploadVariantImage(
  productId: string,
  variantId: string,
  payload: FormData
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return { success: false, message: "Unauthorized" };
    }

    const res = await fetch(`${BASE_API_URL}/products/${productId}/variants/${variantId}/image`, {
      method: "PATCH",
      headers: {
        Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
      },
      body: payload,
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Failed to upload variant image",
      };
    }

    revalidateTag("products", "max");

    return { success: true, data: result.data, message: result.message };
  } catch (error: unknown) {
    console.error("Error uploading variant image:", error);
    return { success: false, message: "Something went wrong" };
  }
}

// Soft-deletes the products ticked in the admin list
export async function bulkDeleteProducts(productIds: string[]) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return { success: false, message: "Unauthorized" };
    }

    const res = await fetch(`${BASE_API_URL}/products/bulk-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
      },
      body: JSON.stringify({ productIds }),
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Failed to delete products",
      };
    }

    revalidateTag("products", "max");

    return { success: true, message: result.message as string };
  } catch (error: unknown) {
    console.error("Error deleting products in bulk:", error);
    return { success: false, message: "Something went wrong" };
  }
}
