"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { IAbandonedCheckout } from "@/types/abandonedCheckout.types";
import { formatDistanceToNow } from "date-fns";
import { Phone } from "lucide-react";

export const abandonedCheckoutColumns: ColumnDef<IAbandonedCheckout>[] = [
  {
    id: "customerInfo",
    header: "Customer Info",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold">{item.fullName || "Unnamed"}</span>
            <Badge variant="outline" className="text-[10px]">
              {item.source === "LANDING_PAGE" ? "Landing Page" : "Storefront"}
            </Badge>
          </div>
          {item.phone && (
            <a
              href={`tel:${item.phone}`}
              className="flex items-center gap-1 text-xs text-primary hover:underline w-fit"
            >
              <Phone className="h-3 w-3" />
              {item.phone}
            </a>
          )}
          {item.district && (
            <span className="text-xs text-muted-foreground">
              {item.district}
              {item.address ? ` — ${item.address}` : ""}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "items",
    header: "Cart Items",
    cell: ({ row }) => {
      const items = row.original.items || [];
      if (items.length === 0) {
        return <span className="text-xs text-muted-foreground">No items</span>;
      }
      return (
        <div className="flex flex-col gap-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.name}</span>
              {item.variantName && (
                <span className="text-xs text-muted-foreground">
                  ({item.variantName})
                </span>
              )}
              <Badge variant="secondary" className="text-[10px]">
                Qty: {item.quantity}
              </Badge>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Est. Total",
    cell: ({ row }) => {
      const total = row.original.total;
      return (
        <div className="font-bold">
          {typeof total === "number" ? `৳${total.toFixed(2)}` : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "lastActivityAt",
    header: "Last Activity",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(row.original.lastActivityAt), {
          addSuffix: true,
        })}
      </div>
    ),
  },
];
