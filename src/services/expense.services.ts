"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  ICreateExpenseCategoryPayload,
  ICreateExpensePayload,
  IExpense,
  IExpenseCategory,
  IExpenseReportSummary,
  IUpdateExpenseCategoryPayload,
  IUpdateExpensePayload,
} from "@/types/expense.types";

// ── Expense Categories ──────────────────────────────────────────────

export const createExpenseCategory = async (payload: ICreateExpenseCategoryPayload) => {
  try {
    return await httpClient.post<IExpenseCategory>("/expenses/categories", payload);
  } catch (error) {
    console.error("Error creating expense category:", error);
    throw error;
  }
};

export const getMyExpenseCategories = async (queryParams?: Record<string, string>) => {
  try {
    return await httpClient.get<IExpenseCategory[]>("/expenses/categories", {
      params: queryParams,
    });
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    throw error;
  }
};

export const updateExpenseCategory = async (
  id: string,
  payload: IUpdateExpenseCategoryPayload,
) => {
  try {
    return await httpClient.patch<IExpenseCategory>(`/expenses/categories/${id}`, payload);
  } catch (error) {
    console.error("Error updating expense category:", error);
    throw error;
  }
};

export const deleteExpenseCategory = async (id: string) => {
  try {
    return await httpClient.delete<null>(`/expenses/categories/${id}`);
  } catch (error) {
    console.error("Error deleting expense category:", error);
    throw error;
  }
};

// ── Expenses ─────────────────────────────────────────────────────────

export const createExpense = async (payload: ICreateExpensePayload) => {
  try {
    return await httpClient.post<IExpense>("/expenses", payload);
  } catch (error) {
    console.error("Error creating expense:", error);
    throw error;
  }
};

export const getMyExpenses = async (queryParams?: Record<string, string>) => {
  try {
    return await httpClient.get<IExpense[]>("/expenses", { params: queryParams });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

export const updateExpense = async (id: string, payload: IUpdateExpensePayload) => {
  try {
    return await httpClient.patch<IExpense>(`/expenses/${id}`, payload);
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

export const deleteExpense = async (id: string) => {
  try {
    return await httpClient.delete<null>(`/expenses/${id}`);
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

export const getExpenseReportSummary = async () => {
  try {
    return await httpClient.get<IExpenseReportSummary>("/expenses/report/summary");
  } catch (error) {
    console.error("Error fetching expense report:", error);
    throw error;
  }
};
