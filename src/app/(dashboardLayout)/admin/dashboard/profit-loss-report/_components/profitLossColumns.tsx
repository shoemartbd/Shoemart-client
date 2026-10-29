"use client";

import { Badge } from "@/components/ui/badge";
import { IProfitLossItem } from "@/types/profitLoss.types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const profitLossColumns: ColumnDef<IProfitLossItem>[] = [
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{row.original.product?.name}</span>
        {row.original.productVariant?.combination && (
          <span className="text-xs text-muted-foreground">
            {row.original.productVariant.combination}
          </span>
        )}
      </div>
    ),
  },
  {
    id: "purchasePrice",
    header: "Purchase Price",
    cell: ({ row }) => <div>৳{Number(row.original.unitCost).toFixed(2)}</div>,
  },
  {
    accessorKey: "price",
    header: "Sale Price",
    cell: ({ row }) => <div>৳{Number(row.original.price).toFixed(2)}</div>,
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => (
      <div>
        {row.original.quantity}
        {row.original.returnedQuantity > 0 && (
          <span className="text-destructive font-semibold">
            {" "}
            ({row.original.returnedQuantity} returned)
          </span>
        )}
      </div>
    ),
  },
  {
    id: "totalSale",
    header: "Total Sale",
    cell: ({ row }) => <div className="font-semibold">৳{row.original.lineTotal.toFixed(2)}</div>,
  },
  {
    id: "totalCost",
    header: "Total Cost",
    cell: ({ row }) => <div>৳{row.original.lineCost.toFixed(2)}</div>,
  },
  {
    id: "discount",
    header: "Discount",
    cell: ({ row }) => <div>৳{row.original.lineDiscount.toFixed(2)}</div>,
  },
  {
    id: "profit",
    header: "Profit / Loss",
    cell: ({ row }) => {
      const profit = row.original.lineProfit;
      return (
        <div className={`font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
          ৳{profit.toFixed(2)}
        </div>
      );
    },
  },
  {
    id: "orderNumber",
    header: "Order No.",
    cell: ({ row }) => (
      <div className="font-mono text-xs font-bold">{row.original.order?.orderNumber}</div>
    ),
  },
  {
    id: "orderType",
    header: "Order Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-semibold text-[10px]">
        {row.original.order?.orderType}
      </Badge>
    ),
  },
  {
    id: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {row.original.order?.createdAt
          ? format(new Date(row.original.order.createdAt), "MMM d, yyyy")
          : "-"}
      </div>
    ),
  },
];
