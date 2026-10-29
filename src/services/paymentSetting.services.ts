"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IPaymentMethods, IPaymentSetting } from "@/types/paymentSetting.types";

// Public: which payment methods checkout may offer
export const getPaymentSettings = async () => {
  try {
    return await httpClient.get<IPaymentMethods>("/payment-settings");
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch payment settings",
    );
  }
};

// Admin: full settings including gateway credentials
export const getAdminPaymentSettings = async () => {
  try {
    return await httpClient.get<IPaymentSetting>("/payment-settings/admin");
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch payment settings",
    );
  }
};

export const updateSslcommerzSettings = async (payload: {
  sslcommerzEnabled?: boolean;
  sslcommerzMode?: "SANDBOX" | "LIVE";
  sslcommerzStoreId?: string;
  sslcommerzStorePassword?: string;
}) => {
  try {
    return await httpClient.patch<IPaymentSetting>(
      "/payment-settings/sslcommerz",
      payload,
    );
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update SSLCommerz settings",
    );
  }
};

export const updateBkashSettings = async (payload: {
  bkashEnabled?: boolean;
  bkashMode?: "SANDBOX" | "LIVE";
  bkashAppKey?: string;
  bkashAppSecret?: string;
  bkashUsername?: string;
  bkashPassword?: string;
}) => {
  try {
    return await httpClient.patch<IPaymentSetting>("/payment-settings/bkash", payload);
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update bKash settings",
    );
  }
};
