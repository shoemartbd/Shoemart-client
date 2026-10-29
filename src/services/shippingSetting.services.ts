"use server";

import { httpClient } from "@/lib/axios/httpClient";

export const getShippingSettings = async () => {
  try {
    const res = await httpClient.get<any>("/shipping-settings");
    return res;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch shipping settings"
    );
  }
};

export const updateShippingSettings = async (payload: {
  insideDhakaShippingFee?: number;
  outsideDhakaShippingFee?: number;
}) => {
  try {
    const res = await httpClient.patch<any>("/shipping-settings", payload);
    return res;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update shipping settings"
    );
  }
};
