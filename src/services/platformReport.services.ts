"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IPlatformOverview,
  IPlatformReportItem,
  IPlatformReportTotals,
  IPlatformSummary,
} from "@/types/platformReport.types";

export const getPlatformSummary = async () => {
  try {
    return await httpClient.get<IPlatformSummary>("/platform-report/summary");
  } catch (error) {
    console.error("Error fetching platform summary:", error);
    throw error;
  }
};

export const getPlatformOverview = async (queryParams?: Record<string, string>) => {
  try {
    return await httpClient.get<IPlatformOverview>("/platform-report/overview", {
      params: queryParams,
    });
  } catch (error) {
    console.error("Error fetching platform overview:", error);
    throw error;
  }
};

export const getPlatformItems = async (queryParams?: Record<string, string>) => {
  try {
    return await httpClient.get<{
      items: IPlatformReportItem[];
      totals: IPlatformReportTotals;
    }>("/platform-report/items", { params: queryParams });
  } catch (error) {
    console.error("Error fetching platform report items:", error);
    throw error;
  }
};
