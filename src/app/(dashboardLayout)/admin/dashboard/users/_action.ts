"use server";

import {
  changeUserRole,
  changeUserStatus,
  deleteUser,
} from "@/services/user.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { IUser, UserRole, UserStatus } from "@/types/user.types";
import { revalidatePath, revalidateTag } from "next/cache";

const getActionErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
};

export const changeUserStatusAction = async (
  userId: string,
  status: UserStatus,
): Promise<ApiResponse<IUser> | ApiErrorResponse> => {
  try {
    const result = (await changeUserStatus(
      userId,
      status,
    )) as ApiResponse<IUser>;
    if (result.success) {
      revalidateTag("users", "max");
      revalidatePath("/admin/dashboard/users");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to change user status"),
    };
  }
};

export const changeUserRoleAction = async (
  userId: string,
  role: UserRole,
): Promise<ApiResponse<IUser> | ApiErrorResponse> => {
  try {
    const result = (await changeUserRole(userId, role)) as ApiResponse<IUser>;
    if (result.success) {
      revalidateTag("users", "max");
      revalidatePath("/admin/dashboard/users");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to change user role"),
    };
  }
};

export const deleteUserAction = async (
  id: string,
): Promise<ApiResponse<null> | ApiErrorResponse> => {
  try {
    const result = (await deleteUser(id)) as ApiResponse<null>;
    if (result.success) {
      revalidateTag("users", "max");
      revalidatePath("/admin/dashboard/users");
    }
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete user"),
    };
  }
};
