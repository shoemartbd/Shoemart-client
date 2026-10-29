"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ITestimonial } from "@/types/testimonial.types";

// Public list returns active testimonials only; pass includeInactive for the admin page
export const getTestimonials = async (includeInactive = false) => {
  try {
    const res = await httpClient.get<ITestimonial[]>("/testimonials", {
      params: includeInactive ? { all: "true" } : undefined,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch testimonials");
  }
};

export const createTestimonial = async (formData: FormData) => {
  try {
    const res = await httpClient.post<ITestimonial>("/testimonials", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to create testimonial");
  }
};

export const updateTestimonial = async (id: string, formData: FormData) => {
  try {
    const res = await httpClient.patch<ITestimonial>(`/testimonials/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update testimonial");
  }
};

export const deleteTestimonial = async (id: string) => {
  try {
    const res = await httpClient.delete<ITestimonial>(`/testimonials/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete testimonial");
  }
};
