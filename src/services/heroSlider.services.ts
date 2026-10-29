"use server";

import { httpClient } from "@/lib/axios/httpClient";

export const getHeroSliders = async () => {
  try {
    const res = await httpClient.get<any>("/hero-sliders");
    return res.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch hero sliders"
    );
  }
};

export const createHeroSlider = async (formData: FormData) => {
  try {
    const res = await httpClient.post<any>("/hero-sliders", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to create hero slider"
    );
  }
};

export const deleteHeroSlider = async (id: string) => {
  try {
    const res = await httpClient.delete<any>(`/hero-sliders/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to delete hero slider"
    );
  }
};
