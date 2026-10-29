"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IClientLogo } from "@/types/clientLogo.types";

// Public list returns active clients only; pass includeInactive for the admin page
export const getClientLogos = async (includeInactive = false) => {
  try {
    const res = await httpClient.get<IClientLogo[]>("/client-logos", {
      params: includeInactive ? { all: "true" } : undefined,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch clients");
  }
};

export const createClientLogo = async (formData: FormData) => {
  try {
    const res = await httpClient.post<IClientLogo>("/client-logos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to add client");
  }
};

export const updateClientLogo = async (id: string, formData: FormData) => {
  try {
    const res = await httpClient.patch<IClientLogo>(`/client-logos/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update client");
  }
};

export const deleteClientLogo = async (id: string) => {
  try {
    const res = await httpClient.delete<IClientLogo>(`/client-logos/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete client");
  }
};
