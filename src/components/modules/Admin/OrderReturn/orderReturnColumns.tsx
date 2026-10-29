"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { IOrderReturn } from "@/types/orderReturn.types";
import { format } from "date-fns";

export const orderReturnColumns: ColumnDef<IOrderReturn>[] = [
  {
    id: "customerInfo",
    header: "Customer Info",
    cell: ({ row }) => {
      const orderReturn = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold">{orderReturn.order?.fullName}</span>
            {orderReturn.order?.orderNumber && (
              <Badge variant="secondary" className="font-mono text-[10px]">
                #{orderReturn.order.orderNumber}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{orderReturn.order?.phone}</span>
          {orderReturn.order?.district && (
            <span className="text-xs text-muted-foreground">{orderReturn.order.district}</span>
          )}
        </div>
      );
    },
  },
  {
    id: "returnedItems",
    header: "Returned Items",
    cell: ({ row }) => {
      const items = row.original.items;
      return (
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.product?.name}</span>
              <Badge variant="destructive" className="text-[10px]">
                Returned Qty: {item.quantity}
              </Badge>
              <span className="text-xs text-muted-foreground">
                ৳{item.price.toFixed(2)} each
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "refundAmount",
    header: "Refund Amount",
    cell: ({ row }) => {
      const orderReturn = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-black text-destructive">
            ৳{orderReturn.refundAmount.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {orderReturn.items.length} item{orderReturn.items.length > 1 ? "s" : ""}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Return Date",
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue("createdAt")), "d MMM yyyy")}</div>
    ),
  },
];
