"use server";

import { httpClient } from "@/lib/axios/httpClient";

export interface IBlockedPhone {
  id: string;
  phone: string;
  reason: string | null;
  orderNumber: string | null;
  blockedBy: string | null;
  createdAt: string;
}

const fail = (error: any, fallback: string): never => {
  throw new Error(error?.response?.data?.message || fallback);
};

export const getBlockedPhones = async (searchTerm?: string) => {
  try {
    return (
      await httpClient.get<IBlockedPhone[]>("/blocked-phones", {
        params: searchTerm ? { searchTerm } : undefined,
      })
    ).data;
  } catch (error) {
    return fail(error, "Failed to load blocked numbers");
  }
};

// Either from an order (uses its phone) or a number typed by the admin
export const blockPhone = async (payload: {
  orderId?: string;
  phone?: string;
  reason?: string;
}) => {
  try {
    return (await httpClient.post<IBlockedPhone>("/blocked-phones", payload)).data;
  } catch (error) {
    return fail(error, "Failed to block number");
  }
};

export const unblockPhone = async (id: string) => {
  try {
    return (await httpClient.delete(`/blocked-phones/${id}`)).data;
  } catch (error) {
    return fail(error, "Failed to unblock number");
  }
};
