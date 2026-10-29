"use server";

import { createBlog, deleteBlog, updateBlog } from "@/services/blog.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { IBlog } from "@/types/blog.types";
import { revalidatePath, revalidateTag } from "next/cache";

const getActionErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
};

export const createBlogAction = async (
  formData: FormData,
): Promise<ApiResponse<IBlog> | ApiErrorResponse> => {
  try {
    const result = await createBlog(formData);
    if (result.success) {
      revalidateTag("blogs", "max");
      revalidatePath("/admin/dashboard/blogs");
      revalidatePath("/blogs");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to create blog post"),
    };
  }
};

export const updateBlogAction = async (
  id: string,
  formData: FormData,
): Promise<ApiResponse<IBlog> | ApiErrorResponse> => {
  try {
    const result = await updateBlog(id, formData);
    if (result.success) {
      revalidateTag("blogs", "max");
      revalidatePath("/admin/dashboard/blogs");
      revalidatePath("/blogs");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update blog post"),
    };
  }
};

export const deleteBlogAction = async (
  id: string,
): Promise<ApiResponse<IBlog> | ApiErrorResponse> => {
  try {
    const result = await deleteBlog(id);
    if (result.success) {
      revalidateTag("blogs", "max");
      revalidatePath("/admin/dashboard/blogs");
      revalidatePath("/blogs");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete blog post"),
    };
  }
};
