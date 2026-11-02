"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IStore } from "@/types/store.types";

// Public list returns active stores only; pass includeInactive for the admin page
export const getStores = async (includeInactive = false) => {
  try {
    const res = await httpClient.get<IStore[]>("/stores", {
      params: includeInactive ? { all: "true" } : undefined,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch stores");
  }
};

export const createStore = async (formData: FormData) => {
  try {
    const res = await httpClient.post<IStore>("/stores", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to create store");
  }
};

export const updateStore = async (id: string, formData: FormData) => {
  try {
    const res = await httpClient.patch<IStore>(`/stores/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update store");
  }
};

export const deleteStore = async (id: string) => {
  try {
    const res = await httpClient.delete<IStore>(`/stores/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete store");
  }
};
