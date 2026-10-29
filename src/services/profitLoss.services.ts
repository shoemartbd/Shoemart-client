"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IProfitLossItem, IProfitLossSummary, IProfitLossTotals } from "@/types/profitLoss.types";

export const getProfitLossSummary = async () => {
  try {
    return await httpClient.get<IProfitLossSummary>("/profit-loss/summary");
  } catch (error) {
    console.error("Error fetching profit & loss summary:", error);
    throw error;
  }
};

export const getProfitLossItems = async (queryParams?: Record<string, string>) => {
  try {
    return await httpClient.get<{
      items: IProfitLossItem[];
      totals: IProfitLossTotals;
    }>("/profit-loss/items", { params: queryParams });
  } catch (error) {
    console.error("Error fetching profit & loss items:", error);
    throw error;
  }
};
