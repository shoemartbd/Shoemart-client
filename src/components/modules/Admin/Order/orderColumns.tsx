/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { COURIER_LABEL, IOrder } from "@/types/order.types";
import { format } from "date-fns";
import Image from "next/image";
import { Package } from "lucide-react";
import MarkFraudButton from "./MarkFraudButton";

export const orderColumns: ColumnDef<IOrder>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderNumber",
    header: "Order No.",
    cell: ({ row }) => (
      <div className="font-mono text-xs font-bold">{row.getValue("orderNumber")}</div>
    ),
  },
  {
    accessorKey: "fullName",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("fullName")}</span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {row.original.phone}
          {row.original.isPhoneBlocked && (
            <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
              Blocked
            </span>
          )}
        </span>
      </div>
    ),
  },
  {
    id: "products",
    header: "Products",
    cell: ({ row }) => {
      const items = row.original.items ?? [];
      const shown = items.slice(0, 2);
      return (
        <div className="flex max-w-[280px] flex-col gap-1.5">
          {shown.map((item) => {
            const image = item.productVariant?.image || item.product?.images?.[0];
            return (
              <div key={item.id} className="flex items-center gap-2" title={item.product?.name}>
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                  {image ? (
                    <Image src={image} alt="" fill sizes="40px" className="object-cover" />
                  ) : (
                    <Package className="m-auto mt-2.5 h-4 w-4 text-muted-foreground/50" />
                  )}
                </div>
                <span className="min-w-0 text-xs leading-snug">
                  <span className="line-clamp-2 font-medium">
                    {item.product?.name ?? "Deleted product"}
                  </span>
                  <span className="text-muted-foreground">
                    {item.productVariant?.combination && `${item.productVariant.combination} · `}
                    × {item.quantity}
                  </span>
                </span>
              </div>
            );
          })}
          {items.length > shown.length && (
            <span className="text-[10px] font-semibold text-primary">
              +{items.length - shown.length} more
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => (
      <div className="font-bold">
        ৳{Number(row.getValue("totalAmount")).toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "orderStatus",
    header: "Order Status",
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
    id: "courier",
    header: "Courier",
    cell: ({ row }) => {
      const order = row.original;
      if (!order.courierProvider) {
        return <span className="text-xs text-muted-foreground">Not assigned</span>;
      }
      const statusVariants: Record<string, string> = {
        delivered: "default",
        partial_delivered: "default",
        pending: "secondary",
        in_review: "secondary",
        cancelled: "destructive",
        hold: "destructive",
        unknown: "outline",
      };
      const statusKey = (order.courierStatus || "").toLowerCase().replace(/\s+/g, "_");
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="w-fit font-semibold">
              {COURIER_LABEL[order.courierProvider] ?? order.courierProvider}
            </Badge>
            {order.courierStatus && (
              <Badge
                variant={(statusVariants[statusKey] as any) || "secondary"}
                className="w-fit text-[10px]"
              >
                {order.courierStatus}
              </Badge>
            )}
          </div>
          {(order.courierTrackingCode || order.courierConsignmentId) && (
            <span className="font-mono text-[10px] text-muted-foreground">
              {order.courierTrackingCode || order.courierConsignmentId}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}</div>
    ),
  },
  {
    // Printing is a bulk action now: tick orders, then Print in the bar above
    id: "fraud",
    header: "Fraud",
    enableSorting: false,
    cell: ({ row }) => <MarkFraudButton order={row.original} />,
  },
];
