"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ISmsSetting } from "@/types/smsSetting.types";

export const getSmsSettings = async () => {
  try {
    return await httpClient.get<ISmsSetting>("/sms-settings");
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch SMS settings",
    );
  }
};

export const updateSmsSettings = async (payload: {
  enabled?: boolean;
  apiKey?: string;
  senderId?: string;
}) => {
  try {
    return await httpClient.patch<ISmsSetting>("/sms-settings", payload);
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update SMS settings",
    );
  }
};
