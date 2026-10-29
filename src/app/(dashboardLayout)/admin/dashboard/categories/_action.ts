"use server";

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/services/category.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { ICategory } from "@/types/category.types";
import { revalidatePath, revalidateTag } from "next/cache";

const getActionErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
};

export const createCategoryAction = async (
  formData: FormData,
): Promise<ApiResponse<ICategory> | ApiErrorResponse> => {
  try {
    const result = await createCategory(formData);
    if (result.success) {
      revalidateTag("categories", "max");
      revalidatePath("/admin/dashboard/categories");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to create category"),
    };
  }
};

export const updateCategoryAction = async (
  id: string,
  formData: FormData,
): Promise<ApiResponse<ICategory> | ApiErrorResponse> => {
  try {
    const result = await updateCategory(id, formData);
    if (result.success) {
      revalidateTag("categories", "max");
      revalidatePath("/admin/dashboard/categories");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update category"),
    };
  }
};

export const deleteCategoryAction = async (
  id: string,
): Promise<ApiResponse<ICategory> | ApiErrorResponse> => {
  try {
    const result = await deleteCategory(id);
    if (result.success) {
      revalidateTag("categories", "max");
      revalidatePath("/admin/dashboard/categories");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete category"),
    };
  }
};
