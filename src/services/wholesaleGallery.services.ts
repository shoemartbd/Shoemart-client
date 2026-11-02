"use server";

import { httpClient } from "@/lib/axios/httpClient";

// One photo in the wholesale "Product View" gallery
export interface IWholesaleGalleryItem {
  id: string;
  name: string;
  code: string;
  image: string;
  categoryId: string;
  categoryName: string;
}

// Active products tagged "Wholesale", grouped client-side by category
export const getWholesaleGallery = async () => {
  try {
    const res = await httpClient.get<IWholesaleGalleryItem[]>("/products/wholesale-gallery");
    return res.data ?? [];
  } catch (error: unknown) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    throw new Error(message || "Failed to load products");
  }
};
