"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IDistrictReportOverview } from "@/types/districtReport.types";

export const getDistrictReportOverview = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  try {
    return await httpClient.get<IDistrictReportOverview>(
      "/district-report/overview",
      { params },
    );
  } catch (error) {
    console.error("Error fetching district report overview:", error);
    throw error;
  }
};
