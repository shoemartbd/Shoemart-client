"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IPeriodSummary } from "@/types/profitLoss.types";

export type WholesaleRequestStatus = "NEW" | "CONTACTED" | "COMPLETED" | "CLOSED";

// One order line (saved snapshot of the product)
export interface IWholesaleRequestProduct {
  productId: string;
  code: string;
  name: string;
  image: string | null;
  color: string | null; // colour of a variable product
  colorOptions?: string[]; // the product's colours (admin colour picker)
  quantity: number; // pairs
  unitPrice: number; // wholesale price per pair
  costPrice: number; // purchase price per pair (internal)
}

export interface IWholesaleTotals {
  pairs: number;
  subtotal: number;
  cost: number;
  total: number;
  profit: number;
  due: number;
}

export interface IWholesaleRequest {
  id: string;
  invoiceNo: number;
  name: string;
  phone: string;
  email: string | null;
  businessName: string | null;
  businessType: string | null;
  location: string | null;
  categories: string[];
  quantity: string | null; // legacy overall size from the old form
  products: IWholesaleRequestProduct[];
  deliveryCharge: number;
  paidAmount: number;
  totals: IWholesaleTotals;
  message: string | null;
  status: WholesaleRequestStatus;
  completedAt: string | null;
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
  items?: { productId: string; quantity: number; color?: string }[];
  message?: string;
}

export interface IUpdateWholesaleRequest {
  status?: WholesaleRequestStatus;
  adminNote?: string;
  items?: {
    productId: string;
    color?: string;
    quantity: number;
    unitPrice: number;
    costPrice?: number;
  }[];
  deliveryCharge?: number;
  paidAmount?: number;
}

// "Add product" search result in the admin editor (Wholesale Products)
export interface IWholesaleProductOption {
  id: string;
  name: string;
  code: string;
  image: string | null;
  colorOptions: string[];
}

export interface IWholesaleReportRow extends IWholesaleTotals {
  id: string;
  invoiceNo: number;
  name: string;
  phone: string;
  businessName: string | null;
  completedAt: string;
  deliveryCharge: number;
  paidAmount: number;
}

export interface IWholesaleReport {
  summary: {
    sales: IPeriodSummary;
    cost: IPeriodSummary;
    profit: IPeriodSummary;
    pairs: IPeriodSummary;
    due: IPeriodSummary;
  };
  items: IWholesaleReportRow[];
  totals: {
    sales: number;
    pairs: number;
    subtotal: number;
    deliveryCharge: number;
    total: number;
    cost: number;
    profit: number;
    paid: number;
    due: number;
  };
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

export const updateWholesaleRequest = async (id: string, payload: IUpdateWholesaleRequest) => {
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

export const searchWholesaleProducts = async (searchTerm?: string) => {
  try {
    return (
      (
        await httpClient.get<IWholesaleProductOption[]>("/wholesale-requests/products", {
          params: { searchTerm },
        })
      ).data ?? []
    );
  } catch (error) {
    return fail(error, "Failed to load products");
  }
};

export const getWholesaleReport = async (params: { startDate?: string; endDate?: string }) => {
  try {
    return (await httpClient.get<IWholesaleReport>("/wholesale-requests/report", { params })).data;
  } catch (error) {
    return fail(error, "Failed to load wholesale report");
  }
};
