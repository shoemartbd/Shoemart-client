/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Star } from "lucide-react";
import Image from "next/image";

export const userReviewColumns: ColumnDef<any>[] = [
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 rounded-lg overflow-hidden border">
          <Image
            src={row.original.product?.images?.[0] || "/placeholder.png"}
            alt={row.original.product?.name || "Product"}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <span className="font-bold text-sm truncate max-w-[200px]">
          {row.original.product?.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < row.original.rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    ),
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground truncate max-w-[300px]">
        {row.original.comment}
      </p>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        {format(new Date(row.original.createdAt), "MMM d, yyyy")}
      </div>
    ),
  },
];
