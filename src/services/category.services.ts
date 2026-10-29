"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ICategory } from "@/types/category.types";

export const getAllCategories = async (queryParams?: Record<string, string>) => {
  try {
    return await httpClient.get<ICategory[]>("/categories", {
      params: queryParams,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const createCategory = async (formData: FormData) => {
  try {
    return await httpClient.post<ICategory>("/categories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (id: string, formData: FormData) => {
  try {
    return await httpClient.patch<ICategory>(`/categories/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    return await httpClient.delete<ICategory>(`/categories/${id}`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

export const getCategoryById = async (id: string) => {
  try {
    return await httpClient.get<ICategory>(`/categories/${id}`);
  } catch (error) {
    console.error("Error fetching category by id:", error);
    throw error;
  }
};
