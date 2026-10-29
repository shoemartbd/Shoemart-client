"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IPermissionGroup, IStaffRole, IStaffUser } from "@/types/staff.types";

const fail = (error: any, fallback: string): never => {
  throw new Error(error?.response?.data?.message || fallback);
};

export const getPermissionGroups = async () => {
  try {
    return (await httpClient.get<IPermissionGroup[]>("/staff/permissions")).data;
  } catch (error) {
    return fail(error, "Failed to load permissions");
  }
};

export const getStaffRoles = async () => {
  try {
    return (await httpClient.get<IStaffRole[]>("/staff/roles")).data;
  } catch (error) {
    return fail(error, "Failed to load roles");
  }
};

export const createStaffRole = async (payload: { name: string; permissions: string[] }) => {
  try {
    return (await httpClient.post<IStaffRole>("/staff/roles", payload)).data;
  } catch (error) {
    return fail(error, "Failed to create role");
  }
};

export const updateStaffRole = async (
  id: string,
  payload: { name?: string; permissions?: string[] },
) => {
  try {
    return (await httpClient.patch<IStaffRole>(`/staff/roles/${id}`, payload)).data;
  } catch (error) {
    return fail(error, "Failed to update role");
  }
};

export const deleteStaffRole = async (id: string) => {
  try {
    return (await httpClient.delete(`/staff/roles/${id}`)).data;
  } catch (error) {
    return fail(error, "Failed to delete role");
  }
};

export const getStaffUsers = async (params?: Record<string, string>) => {
  try {
    return (await httpClient.get<IStaffUser[]>("/staff/users", { params })).data;
  } catch (error) {
    return fail(error, "Failed to load staff");
  }
};

export const createStaffUser = async (payload: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  staffRoleId: string;
}) => {
  try {
    return (await httpClient.post<IStaffUser>("/staff/users", payload)).data;
  } catch (error) {
    return fail(error, "Failed to create staff account");
  }
};

export const updateStaffUser = async (
  id: string,
  payload: {
    name?: string;
    phone?: string;
    staffRoleId?: string;
    status?: "ACTIVE" | "BLOCKED";
    password?: string;
  },
) => {
  try {
    return (await httpClient.patch<IStaffUser>(`/staff/users/${id}`, payload)).data;
  } catch (error) {
    return fail(error, "Failed to update staff account");
  }
};

export const deleteStaffUser = async (id: string) => {
  try {
    return (await httpClient.delete(`/staff/users/${id}`)).data;
  } catch (error) {
    return fail(error, "Failed to delete staff account");
  }
};
