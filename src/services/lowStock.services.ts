"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ILowStockData } from "@/types/lowStock.types";

export const getLowStock = async (params: Record<string, string>) => {
  try {
    return await httpClient.get<ILowStockData>("/low-stock", { params });
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch low stock products",
    );
  }
};

export const updateStock = async (payload: {
  productId: string;
  variantId?: string | null;
  stock: number;
}) => {
  try {
    return await httpClient.patch("/low-stock/stock", payload);
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update stock");
  }
};
