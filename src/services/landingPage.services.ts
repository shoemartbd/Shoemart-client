"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ILandingPage } from "@/types/landingPage.types";

export const createLandingPage = async (formData: FormData) => {
  try {
    return await httpClient.post<ILandingPage>("/landing-pages", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to create landing page",
    );
  }
};

export const getMyLandingPages = async (queryParams?: Record<string, string>) => {
  try {
    return await httpClient.get<ILandingPage[]>("/landing-pages/my-landing-pages", {
      params: queryParams,
    });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch landing pages",
    );
  }
};

export const getLandingPageById = async (id: string) => {
  try {
    return await httpClient.get<ILandingPage>(`/landing-pages/${id}`);
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch landing page",
    );
  }
};

export const updateLandingPage = async (id: string, formData: FormData) => {
  try {
    return await httpClient.patch<ILandingPage>(`/landing-pages/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to update landing page",
    );
  }
};

export const deleteLandingPage = async (id: string) => {
  try {
    return await httpClient.delete<ILandingPage>(`/landing-pages/${id}`);
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to delete landing page",
    );
  }
};

// Public — used by the /lp/[slug] storefront page, no auth required
export const getLandingPageBySlug = async (slug: string) => {
  try {
    return await httpClient.get<ILandingPage>(`/landing-pages/slug/${slug}`);
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch landing page",
    );
  }
};

export const placeLandingPageOrder = async (
  slug: string,
  payload: {
    fullName: string;
    phone: string;
    address: string;
    district: string;
    productVariantId?: string | null;
    quantity: number;
    shippingFee?: number;
    checkoutSessionToken?: string;
    notes?: string;
    paymentMethod?: "COD" | "BKASH";
  },
) => {
  try {
    return await httpClient.post<{ id: string; userId: string | null }>(
      `/landing-pages/slug/${slug}/order`,
      payload,
    );
  } catch (error: any) {
    // Guest checkout is off and the customer isn't logged in
    if (error?.response?.status === 403) {
      return {
        success: false,
        message: error.response.data?.message || "Please log in to place an order",
        code: "LOGIN_REQUIRED",
      } as const;
    }
    throw new Error(
      error?.response?.data?.message || "Failed to place order",
    );
  }
};
