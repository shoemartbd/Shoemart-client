"use server";

import { httpClient } from "@/lib/axios/httpClient";

export type WholesaleRequestStatus = "NEW" | "CONTACTED" | "CLOSED";

export interface IWholesaleRequest {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  businessName: string | null;
  businessType: string | null;
  location: string | null;
  categories: string[];
  quantity: string | null;
  message: string | null;
  status: WholesaleRequestStatus;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateWholesaleRequest {
  name: string;
  phone: string;
  email?: string;
  businessName?: string;
  businessType?: string;
  location?: string;
  categories?: string[];
  quantity?: string;
  message?: string;
}

const fail = (error: unknown, fallback: string): never => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  throw new Error(response?.data?.message || fallback);
};

// Public: the /wholesale landing page form
export const createWholesaleRequest = async (payload: ICreateWholesaleRequest) => {
  try {
    return await httpClient.post<{ id: string }>("/wholesale-requests", payload);
  } catch (error) {
    return fail(error, "Failed to send your request");
  }
};

export const getWholesaleRequests = async (params: {
  status?: WholesaleRequestStatus;
  searchTerm?: string;
}) => {
  try {
    return (
      await httpClient.get<{
        data: IWholesaleRequest[];
        summary: Record<WholesaleRequestStatus, number>;
      }>("/wholesale-requests", { params })
    ).data;
  } catch (error) {
    return fail(error, "Failed to load wholesale requests");
  }
};

export const updateWholesaleRequest = async (
  id: string,
  payload: { status?: WholesaleRequestStatus; adminNote?: string },
) => {
  try {
    return (await httpClient.patch<IWholesaleRequest>(`/wholesale-requests/${id}`, payload)).data;
  } catch (error) {
    return fail(error, "Failed to update request");
  }
};

export const deleteWholesaleRequest = async (id: string) => {
  try {
    return (await httpClient.delete(`/wholesale-requests/${id}`)).data;
  } catch (error) {
    return fail(error, "Failed to delete request");
  }
};
