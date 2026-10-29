"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IAdminDashboardData } from "@/types/dashboard.types";

export async function getDashboardData() {
  try {
    const response = await httpClient.get<IAdminDashboardData>("/admin/stats");

    return response;
  } catch (error: unknown) {
    console.log(error, "From Dashboard Server Action");
    return {
      success: false,
      message:
        (error as Error).message ||
        "An error occurred while fetching dashboard data.",
      data: null,
      meta: null,
    };
  }
}

export async function getAnalyticsData() {
  try {
    const response =
      await httpClient.get<IAdminDashboardData>("/stats/analytics");
    return response;
  } catch (error: unknown) {
    console.log(error, "From Analytics Server Action");
    return {
      success: false,
      message:
        (error as Error).message ||
        "An error occurred while fetching analytics data.",
      data: null,
      meta: null,
    };
  }
}
