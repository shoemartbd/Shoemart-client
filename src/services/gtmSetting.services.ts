"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IGtmSetting, IPublicGtmSetting } from "@/types/gtmSetting.types";
import { ApiResponse } from "@/types/api.types";
import { revalidateTag } from "next/cache";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// Public: the container to load, or null when GTM is off. Cached so the
// storefront doesn't call the backend for it on every page load.
export const getPublicGtmSettings = async () => {
  try {
    const res = await fetch(`${BASE_API_URL}/gtm-settings/public`, {
      next: { revalidate: 300, tags: ["gtm-settings"] },
    });
    if (!res.ok) return null;
    const json: ApiResponse<IPublicGtmSetting | null> = await res.json();
    return json.data ?? null;
  } catch {
    // Tracking must never break the page
    return null;
  }
};

export const getGtmSettings = async () => {
  try {
    const res = await httpClient.get<IGtmSetting>("/gtm-settings");
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch GTM settings");
  }
};

export const updateGtmSettings = async (payload: {
  isEnabled?: boolean;
  containerId?: string;
  scriptDomain?: string;
}) => {
  try {
    const res = await httpClient.patch<IGtmSetting>("/gtm-settings", payload);
    revalidateTag("gtm-settings", "max");
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update GTM settings");
  }
};
