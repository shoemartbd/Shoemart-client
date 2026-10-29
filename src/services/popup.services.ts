"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IActivePopup, IPopup } from "@/types/popup.types";

// Public: the popup to show on the storefront, or null
export const getActivePopup = async () => {
  try {
    const res = await httpClient.get<IActivePopup | null>("/popups/active");
    return res.data;
  } catch {
    // A popup is never worth breaking the page for
    return null;
  }
};

export const getPopups = async () => {
  try {
    const res = await httpClient.get<IPopup[]>("/popups");
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch popups");
  }
};

export const createPopup = async (formData: FormData) => {
  try {
    const res = await httpClient.post<IPopup>("/popups", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to create popup");
  }
};

export const updatePopup = async (id: string, formData: FormData) => {
  try {
    const res = await httpClient.patch<IPopup>(`/popups/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update popup");
  }
};

export const deletePopup = async (id: string) => {
  try {
    const res = await httpClient.delete<IPopup>(`/popups/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete popup");
  }
};
