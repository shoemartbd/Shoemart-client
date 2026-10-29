"use server";

import { httpClient } from "@/lib/axios/httpClient";

// Online checkout (signed-in customer). Returns the bKash page to redirect to.
export const initiateBkashPayment = async (orderId: string) => {
  try {
    return await httpClient.post<{ bkashURL: string; orderId: string }>(
      "/payments/bkash/initiate",
      { orderId },
    );
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to start bKash payment",
    );
  }
};

// Orders placed without an account (online checkout or landing page)
export const initiateBkashGuestPayment = async (orderId: string) => {
  try {
    return await httpClient.post<{ bkashURL: string; orderId: string }>(
      "/payments/bkash/initiate-guest",
      { orderId },
    );
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to start bKash payment",
    );
  }
};

export const initiateSslcommerzPayment = async (orderId: string) => {
  try {
    return await httpClient.post<{ gatewayPageURL: string; orderId: string }>(
      "/payments/sslcommerz/initiate",
      { orderId },
    );
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to start SSLCommerz payment",
    );
  }
};

// Orders placed without an account
export const initiateSslcommerzGuestPayment = async (orderId: string) => {
  try {
    return await httpClient.post<{ gatewayPageURL: string; orderId: string }>(
      "/payments/sslcommerz/initiate-guest",
      { orderId },
    );
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to start SSLCommerz payment",
    );
  }
};
