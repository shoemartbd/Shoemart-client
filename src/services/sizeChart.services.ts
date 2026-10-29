"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ISizeChart } from "@/types/sizeChart.types";

export const getSizeCharts = async () => {
  try {
    const res = await httpClient.get<ISizeChart[]>("/size-charts");
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch size charts");
  }
};

export const createSizeChart = async (formData: FormData) => {
  try {
    const res = await httpClient.post<ISizeChart>("/size-charts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to create size chart");
  }
};

export const updateSizeChart = async (id: string, formData: FormData) => {
  try {
    const res = await httpClient.patch<ISizeChart>(`/size-charts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update size chart");
  }
};

export const deleteSizeChart = async (id: string) => {
  try {
    const res = await httpClient.delete<ISizeChart>(`/size-charts/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete size chart");
  }
};
