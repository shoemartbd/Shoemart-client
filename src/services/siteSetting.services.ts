"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ISiteSetting } from "@/types/siteSetting.types";
import { ApiResponse } from "@/types/api.types";
import { revalidateTag } from "next/cache";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// Public and rarely changed, so it is cached (no cookies) instead of hitting
// the backend on every page load. Saving the settings clears the cache.
export const getSiteSettings = async (): Promise<ApiResponse<ISiteSetting>> => {
  try {
    const res = await fetch(`${BASE_API_URL}/site-settings`, {
      next: { revalidate: 300, tags: ["site-settings"] },
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (error: any) {
    console.error("Failed to fetch site settings:", error);
    return { data: undefined } as any;
  }
};

export const updateSiteSettings = async (formData: FormData) => {
  try {
    const res = await httpClient.patch<ISiteSetting>("/site-settings", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    revalidateTag("site-settings", "max");
    return res;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update site settings",
    );
  }
};
