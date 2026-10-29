"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  IDistrictReportDistrict,
  IDistrictReportOrder,
} from "@/types/districtReport.types";

const CHANNEL_COLORS: Record<string, string> = {
  ONLINE: "#2a78d6",
  POS: "#eb6834",
  LANDING_PAGE: "#1baf7a",
};

const fmt = (v: number) => `৳${Number(v || 0).toFixed(2)}`;

export const districtColumns: ColumnDef<IDistrictReportDistrict>[] = [
  {
    accessorKey: "district",
    header: "District",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.district}</div>
    ),
  },
  {
    accessorKey: "totalOrders",
    header: "Orders",
    cell: ({ row }) => <div>{row.original.totalOrders}</div>,
  },
  {
    accessorKey: "totalRevenue",
    header: "Revenue",
    cell: ({ row }) => (
      <div className="font-bold">{fmt(row.original.totalRevenue)}</div>
    ),
  },
  {
    accessorKey: "totalQuantity",
    header: "Quantity",
    cell: ({ row }) => <div>{row.original.totalQuantity}</div>,
  },
  {
    id: "topProduct",
    header: "Top Product",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.topProducts?.[0]?.name || "—"}
      </div>
    ),
  },
];

export const orderColumns: ColumnDef<IDistrictReportOrder>[] = [
  {
    id: "orderNumber",
    header: "Order #",
    cell: ({ row }) => (
      <div className="font-mono text-xs font-bold">
        {row.original.orderNumber || "-"}
      </div>
    ),
  },
  {
    accessorKey: "fullName",
    header: "Customer",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.fullName || "-"}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.phone || "-"}</div>
    ),
  },
  {
    accessorKey: "district",
    header: "District",
    cell: ({ row }) => <div className="text-sm">{row.original.district}</div>,
  },
  {
    id: "orderType",
    header: "Channel",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="font-semibold text-[10px]"
        style={{
          borderColor: CHANNEL_COLORS[row.original.orderType],
          color: CHANNEL_COLORS[row.original.orderType],
        }}
      >
        {row.original.orderType === "LANDING_PAGE"
          ? "Landing Page"
          : row.original.orderType}
      </Badge>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-bold">{fmt(row.original.totalAmount)}</div>
    ),
  },
  {
    id: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {row.original.createdAt
          ? format(new Date(row.original.createdAt), "MMM d, yyyy")
          : "-"}
      </div>
    ),
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      const summary = row.original.items
        .map((i) => `${i.productName} x${i.quantity}`)
        .join(", ");
      return (
        <div className="text-xs max-w-[260px] truncate" title={summary}>
          {summary || "-"}
        </div>
      );
    },
  },
];
