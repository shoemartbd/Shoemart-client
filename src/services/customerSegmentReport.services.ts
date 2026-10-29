"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ICustomerSegmentReportOverview } from "@/types/customerSegmentReport.types";

export const getCustomerSegmentReportOverview = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  try {
    return await httpClient.get<ICustomerSegmentReportOverview>(
      "/customer-segment-report/overview",
      { params },
    );
  } catch (error) {
    console.error("Error fetching customer segment report overview:", error);
    throw error;
  }
};
