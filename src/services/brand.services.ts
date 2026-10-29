"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IBrand } from "@/types/brand.types";

// Public list returns active brands only; pass includeInactive for the admin page
export const getBrands = async (includeInactive = false) => {
  try {
    const res = await httpClient.get<IBrand[]>("/brands", {
      params: includeInactive ? { all: "true" } : undefined,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch brands");
  }
};

export const createBrand = async (formData: FormData) => {
  try {
    const res = await httpClient.post<IBrand>("/brands", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to create brand");
  }
};

export const updateBrand = async (id: string, formData: FormData) => {
  try {
    const res = await httpClient.patch<IBrand>(`/brands/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update brand");
  }
};

export const deleteBrand = async (id: string) => {
  try {
    const res = await httpClient.delete<IBrand>(`/brands/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete brand");
  }
};
