"use server";

import { httpClient } from "@/lib/axios/httpClient";

// One product in the wholesale "Product View" gallery
// (from Dashboard -> Wholesale Products)
export interface IWholesaleGalleryItem {
  id: string;
  name: string;
  code: string;
  image: string; // first photo
  images: string[];
  // Top-level category (the gallery groups by it)
  categoryId: string;
  categoryName: string;
  categoryImage: string | null;
  subcategoryName: string | null;
  colors: string[];
  colorImages: Record<string, string>; // colour -> its own photo
}

export const getWholesaleGallery = async () => {
  try {
    const res = await httpClient.get<IWholesaleGalleryItem[]>("/wholesale-products/gallery");
    return res.data ?? [];
  } catch (error: unknown) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
    throw new Error(message || "Failed to load products");
  }
};
