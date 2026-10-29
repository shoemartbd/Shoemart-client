"use client";

import { Badge } from "@/components/ui/badge";
import { IExpenseCategory } from "@/types/expense.types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const expenseCategoryColumns: ColumnDef<IExpenseCategory>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("isActive") ? "default" : "secondary"}
        className="font-semibold"
      >
        {row.getValue("isActive") ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}
      </div>
    ),
  },
];
