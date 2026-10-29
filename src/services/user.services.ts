"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IUser, UserRole, UserStatus } from "@/types/user.types";

export const getAllUsers = async (queryParams?: Record<string, string>) => {
  try {
    return await httpClient.get<IUser[]>("/admin/users/all", {
      params: queryParams,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const changeUserStatus = async (userId: string, status: UserStatus) => {
  try {
    return await httpClient.patch("/admin/change-user-status", {
      userId,
      status,
    });
  } catch (error) {
    console.error("Error changing user status:", error);
    throw error;
  }
};

export const changeUserRole = async (userId: string, role: UserRole) => {
  try {
    return await httpClient.patch("/admin/change-user-role", {
      userId,
      role,
    });
  } catch (error) {
    console.error("Error changing user role:", error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    return await httpClient.delete(`/admin/users/${id}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
