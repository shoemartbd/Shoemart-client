import { z } from "zod";

export const expenseCategoryZodSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export const expenseZodSchema = z.object({
  categoryId: z.string().uuid("Please select a category"),
  name: z.string().min(1, "Name is required").max(150, "Name is too long"),
  price: z.number().positive("Price must be positive"),
  note: z.string().max(500, "Note is too long").optional(),
  date: z.string().min(1, "Date is required"),
});

export type IExpenseCategoryFormData = z.infer<typeof expenseCategoryZodSchema>;
export type IExpenseFormData = z.infer<typeof expenseZodSchema>;
