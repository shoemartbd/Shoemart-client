"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";
import { Package } from "lucide-react";
import { ICategory } from "@/types/category.types";

export interface IProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  sku?: string | null;
  stock: number;
  purchasePrice: number;
  regularPrice: number;
  sellPrice: number;
  status: "ACTIVE" | "DRAFT" | "OUT_OF_STOCK" | "DELETED";
  type?: "SIMPLE" | "VARIABLE" | string;
  images: string[];
  videoUrl?: string | null;
  createdAt: string;
  category: ICategory;
  attributes?: any[];
  variants?: any[];
  sizeChartId?: string | null;
  sizeChart?: { id: string; name: string; image: string } | null;
}

const statusConfig = {
  ACTIVE: {
    label: "Active",
    className: "bg-green-500/10 text-green-600 border-green-200",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-gray-500/10 text-gray-600 border-gray-200",
  },
  OUT_OF_STOCK: {
    label: "Out of Stock",
    className: "bg-red-500/10 text-red-600 border-red-200",
  },
  DELETED: {
    label: "Deleted",
    className: "bg-gray-800/10 text-gray-800 border-gray-300",
  },
};

export const productColumns: ColumnDef<IProduct>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                width={40}
                height={40}
                className="object-cover h-full w-full"
              />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
            {product.category && (
              <p className="text-xs text-muted-foreground">
                {product.category.name}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "sellPrice",
    header: "Price",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-primary">
            ৳{product.sellPrice.toFixed(2)}
          </span>
          {product.regularPrice > product.sellPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ৳{product.regularPrice.toFixed(2)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.original.stock;
      return (
        <Badge
          variant="outline"
          className={stock > 0 ? "bg-blue-500/10 text-blue-600" : "bg-red-500/10 text-red-600"}
        >
          {stock} in stock
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "ACTIVE";
      const config = statusConfig[status] || statusConfig.ACTIVE;
      return (
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Added On",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
      </span>
    ),
  },
];
