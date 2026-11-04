"use server";

import { httpClient } from "@/lib/axios/httpClient";

export interface IWholesaleColour {
  name: string;
  image: string | null;
}

// A product in Dashboard -> Wholesale Products
export interface IWholesaleProduct {
  id: string;
  codeNo: number;
  code: string; // WP-0007
  name: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    image: string | null;
    parentId: string | null;
    parent: { id: string; name: string; image: string | null } | null;
  };
  images: string[];
  colors: IWholesaleColour[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const fail = (error: unknown, fallback: string): never => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  throw new Error(response?.data?.message || fallback);
};

export const getWholesaleProducts = async (params: { searchTerm?: string; categoryId?: string }) => {
  try {
    return (
      (await httpClient.get<IWholesaleProduct[]>("/wholesale-products", { params })).data ?? []
    );
  } catch (error) {
    return fail(error, "Failed to load wholesale products");
  }
};

// FormData fields: name, categoryId, isActive, keepImages (JSON url list),
// images (files), colors (JSON [{ name, image?, upload? }]), colorImages (files)
export const createWholesaleProduct = async (formData: FormData) => {
  try {
    return (
      await httpClient.post<IWholesaleProduct>("/wholesale-products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  } catch (error) {
    return fail(error, "Failed to add product");
  }
};

export const updateWholesaleProduct = async (id: string, formData: FormData) => {
  try {
    return (
      await httpClient.patch<IWholesaleProduct>(`/wholesale-products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  } catch (error) {
    return fail(error, "Failed to update product");
  }
};

export const deleteWholesaleProduct = async (id: string) => {
  try {
    return (await httpClient.delete(`/wholesale-products/${id}`)).data;
  } catch (error) {
    return fail(error, "Failed to delete product");
  }
};
