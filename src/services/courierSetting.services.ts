"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ICourierSetting } from "@/types/courierSetting.types";

export const getCourierSettings = async () => {
  try {
    return await httpClient.get<ICourierSetting>("/courier-settings");
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch courier settings",
    );
  }
};

export const updatePathaoSettings = async (payload: {
  pathaoEnabled?: boolean;
  pathaoBaseUrl?: string;
  pathaoClientId?: string;
  pathaoClientSecret?: string;
  pathaoUsername?: string;
  pathaoPassword?: string;
  pathaoStoreId?: string;
}) => {
  try {
    return await httpClient.patch<ICourierSetting>(
      "/courier-settings/pathao",
      payload,
    );
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update Pathao settings",
    );
  }
};

export const updateSteadfastSettings = async (payload: {
  steadfastEnabled?: boolean;
  steadfastApiKey?: string;
  steadfastSecretKey?: string;
  steadfastWebhookAuthToken?: string;
}) => {
  try {
    return await httpClient.patch<ICourierSetting>(
      "/courier-settings/steadfast",
      payload,
    );
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update Steadfast settings",
    );
  }
};

export const updateRedxSettings = async (payload: {
  redxEnabled?: boolean;
  redxMode?: "SANDBOX" | "LIVE";
  redxAccessToken?: string;
  redxPickupStoreId?: string;
  redxWebhookToken?: string;
}) => {
  try {
    return await httpClient.patch<ICourierSetting>("/courier-settings/redx", payload);
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update RedX settings");
  }
};
