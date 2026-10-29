"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IHomePromo } from "@/types/homePromo.types";

export const getHomePromo = async () => {
  try {
    const res = await httpClient.get<IHomePromo>("/home-promo");
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch home promo");
  }
};

export const updateHomePromo = async (formData: FormData) => {
  try {
    const res = await httpClient.patch<IHomePromo>("/home-promo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update home promo");
  }
};
