/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { IOrder } from "@/types/order.types";
import { format } from "date-fns";

export const userOrderColumns: ColumnDef<IOrder>[] = [
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => {
      const order = row.original;
      const firstItem = order.items?.[0];
      if (!firstItem) return null;

      return (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-lg overflow-hidden border bg-muted shrink-0">
            <Image
              src={firstItem.product?.images?.[0] || "/placeholder.png"}
              alt={firstItem.product?.name || "Product"}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm truncate max-w-[150px]">
              {firstItem.product?.name}
            </span>
            {order.items.length > 1 && (
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                + {order.items.length - 1} more items
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "orderNumber",
    header: "Order No.",
    cell: ({ row }) => (
      <div className="font-mono text-[10px] font-bold text-muted-foreground">
        {row.getValue("orderNumber")}
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => (
      <div className="font-bold">
        ৳{Number(row.getValue("totalAmount")).toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "orderStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("orderStatus") as string;
      const variants: Record<string, string> = {
        PENDING: "secondary",
        CONFIRMED: "outline",
        IN_COURIER: "default",
        DELIVERED: "default",
        CANCELLED: "destructive",
      };
      return (
        <Badge variant={variants[status] as any} className="font-semibold">
          {status.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      return (
        <Badge
          variant={status === "PAID" ? "default" : "secondary"}
          className="font-semibold"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Order Date",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground font-medium">
        {format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}
      </div>
    ),
  },
  {
    id: "review",
    header: "Review",
    cell: ({ row }) => {
      const order = row.original;
      const isDelivered = order.orderStatus === "DELIVERED";

      if (!isDelivered) return null;

      return (
        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest animate-pulse">
          Review Available
        </div>
      );
    },
  },
];
