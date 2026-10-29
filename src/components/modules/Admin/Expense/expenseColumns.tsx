"use client";

import { Badge } from "@/components/ui/badge";
import { IExpense } from "@/types/expense.types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const expenseColumns: ColumnDef<IExpense>[] = [
  {
    accessorKey: "name",
    header: "Expense",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold">{row.getValue("name")}</span>
        {row.original.note && (
          <span className="text-xs text-muted-foreground max-w-[220px] truncate">
            {row.original.note}
          </span>
        )}
      </div>
    ),
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-semibold">
        {row.original.category?.name}
      </Badge>
    ),
  },
  {
    accessorKey: "price",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-bold">৳{Number(row.getValue("price")).toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {format(new Date(row.getValue("date")), "MMM d, yyyy")}
      </div>
    ),
  },
];
