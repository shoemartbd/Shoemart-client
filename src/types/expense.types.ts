export interface IExpenseCategory {
  id: string;
  name: string;
  isActive: boolean;
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IExpense {
  id: string;
  name: string;
  price: number;
  note?: string | null;
  date: string;
  categoryId: string;
  category: { id: string; name: string };
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateExpenseCategoryPayload {
  name: string;
}

export interface IUpdateExpenseCategoryPayload {
  name?: string;
  isActive?: boolean;
}

export interface ICreateExpensePayload {
  categoryId: string;
  name: string;
  price: number;
  note?: string;
  date: string;
}

export type IUpdateExpensePayload = Partial<ICreateExpensePayload>;

export interface IExpenseReportSummary {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  allTime: number;
}
