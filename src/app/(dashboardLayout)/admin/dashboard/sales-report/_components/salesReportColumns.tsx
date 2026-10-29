"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ISalesReportItem } from "./types";

export const salesReportColumns: ColumnDef<ISalesReportItem>[] = [
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.product?.name}</span>
        {row.original.productVariant?.combination && (
          <span className="text-xs text-muted-foreground">
            {row.original.productVariant.combination}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
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
    id: "total",
    header: "Total",
    cell: ({ row }) => (
      <div className="font-bold">
        ৳{row.original.lineTotal.toFixed(2)}
      </div>
    ),
  },
  {
    id: "orderNumber",
    header: "Order No.",
    cell: ({ row }) => (
      <div className="font-mono text-xs font-bold">
        {row.original.order?.orderNumber}
      </div>
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

export const productSummaryColumns: ColumnDef<{
  name: string;
  quantity: number;
  total: number;
}>[] = [
  {
    accessorKey: "name",
    header: "Product Name",
  },
  {
    accessorKey: "quantity",
    header: "Total Sold",
    cell: ({ row }) => (
      <div className="font-semibold">{row.original.quantity}</div>
    ),
  },
  {
    accessorKey: "total",
    header: "Total Sales",
    cell: ({ row }) => (
      <div className="font-bold">৳{Number(row.original.total).toFixed(2)}</div>
    ),
  },
];
