"use server";

import {
  createAttribute,
  updateAttribute,
  deleteAttribute,
  addAttributeValue,
  deleteAttributeValue,
  updateAttributeValue,
} from "@/services/attribute.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { IAttribute, IAttributeValue } from "@/types/attribute.types";
import { revalidatePath, revalidateTag } from "next/cache";

const getActionErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
};

export const createAttributeAction = async (payload: {
  name: string;
}): Promise<ApiResponse<IAttribute> | ApiErrorResponse> => {
  try {
    const result = await createAttribute(payload);
    if (result.success) {
      revalidateTag("attributes", "max");
      revalidatePath("/admin/dashboard/attributes");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to create attribute"),
    };
  }
};

export const updateAttributeAction = async (
  id: string,
  payload: { name: string }
): Promise<ApiResponse<IAttribute> | ApiErrorResponse> => {
  try {
    const result = await updateAttribute(id, payload);
    if (result.success) {
      revalidateTag("attributes", "max");
      revalidatePath("/admin/dashboard/attributes");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update attribute"),
    };
  }
};

export const deleteAttributeAction = async (
  id: string
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
  try {
    const result = await deleteAttribute(id);
    if (result.success) {
      revalidateTag("attributes", "max");
      revalidatePath("/admin/dashboard/attributes");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete attribute"),
    };
  }
};

export const addAttributeValueAction = async (
  attributeId: string,
  payload: { value: string }
): Promise<ApiResponse<IAttributeValue> | ApiErrorResponse> => {
  try {
    const result = await addAttributeValue(attributeId, payload);
    if (result.success) {
      revalidateTag("attributes", "max");
      revalidatePath("/admin/dashboard/attributes");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to add attribute value"),
    };
  }
};

export const deleteAttributeValueAction = async (
  valueId: string
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
  try {
    const result = await deleteAttributeValue(valueId);
    if (result.success) {
      revalidateTag("attributes", "max");
      revalidatePath("/admin/dashboard/attributes");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete attribute value"),
    };
  }
};

export const updateAttributeValueAction = async (
  valueId: string,
  payload: { value: string }
): Promise<ApiResponse<IAttributeValue> | ApiErrorResponse> => {
  try {
    const result = await updateAttributeValue(valueId, payload);
    if (result.success) {
      revalidateTag("attributes", "max");
      revalidatePath("/admin/dashboard/attributes");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update attribute value"),
    };
  }
};
