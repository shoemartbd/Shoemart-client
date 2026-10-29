"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Gem } from "lucide-react";
import { ICustomerSegment } from "@/types/customerSegmentReport.types";

const SEGMENT_COLORS: Record<string, string> = {
  NEW: "#2a78d6",
  REGULAR: "#eb6834",
  LOYAL: "#1baf7a",
};

const HIGH_SPENDER_COLOR = "#c99a2e";

const fmt = (v: number) => `৳${Number(v || 0).toFixed(2)}`;

export const customerSegmentColumns: ColumnDef<ICustomerSegment>[] = [
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="font-mono text-xs font-bold">{row.original.phone}</div>
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
    accessorKey: "district",
    header: "District",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.district || "-"}</div>
    ),
  },
  {
    id: "segment",
    header: "Segment",
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <Badge
          variant="outline"
          className="font-semibold text-[10px]"
          style={{
            borderColor: SEGMENT_COLORS[row.original.segment],
            color: SEGMENT_COLORS[row.original.segment],
          }}
        >
          {row.original.segment}
        </Badge>
        {row.original.isHighSpender && (
          <Badge
            variant="outline"
            className="font-semibold text-[10px] gap-1"
            style={{
              borderColor: HIGH_SPENDER_COLOR,
              color: HIGH_SPENDER_COLOR,
            }}
          >
            <Gem className="h-3 w-3" />
            High Spender
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "totalOrders",
    header: "Total Orders",
    cell: ({ row }) => <div>{row.original.totalOrders}</div>,
  },
  {
    accessorKey: "totalRevenue",
    header: "Total Revenue",
    cell: ({ row }) => (
      <div className="font-bold">{fmt(row.original.totalRevenue)}</div>
    ),
  },
  {
    id: "firstOrderDate",
    header: "First Order",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {row.original.firstOrderDate
          ? format(new Date(row.original.firstOrderDate), "MMM d, yyyy")
          : "-"}
      </div>
    ),
  },
  {
    id: "lastOrderDate",
    header: "Last Order",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {row.original.lastOrderDate
          ? format(new Date(row.original.lastOrderDate), "MMM d, yyyy")
          : "-"}
      </div>
    ),
  },
];
