"use server";

import { deleteProduct, updateProduct } from "@/services/product.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { revalidatePath, revalidateTag } from "next/cache";
import { IProduct } from "@/components/modules/Admin/Product/productColumns";

const getActionErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
};

export const deleteProductAction = async (
  id: string,
): Promise<ApiResponse<IProduct> | ApiErrorResponse> => {
  try {
    const result = await deleteProduct(id);
    if (result.success) {
      revalidateTag("products", "max");
      revalidatePath("/admin/dashboard/products");
    }
    return result as ApiResponse<IProduct> | ApiErrorResponse;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete product"),
    };
  }
};

export const updateProductAction = async (
  id: string,
  formData: FormData,
): Promise<ApiResponse<IProduct> | ApiErrorResponse> => {
  try {
    const result = await updateProduct(id, formData);
    if (result.success) {
      revalidateTag("products", "max");
      revalidatePath("/admin/dashboard/products");
    }
    return result as ApiResponse<IProduct> | ApiErrorResponse;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update product"),
    };
  }
};
