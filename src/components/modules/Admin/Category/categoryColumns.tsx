import DateCell from "@/components/shared/cell/DateCell";
import { Badge } from "@/components/ui/badge";
import { ICategory } from "@/types/category.types";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Plus } from "lucide-react";

export const categoryColumns: ColumnDef<ICategory>[] = [
  {
    id: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="relative h-10 w-10 overflow-hidden rounded-md border">
        {row.original.image ? (
          <Image
            src={row.original.image}
            alt={row.original.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    ),
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">{row.original.slug}</span>
      </div>
    ),
  },
  {
    id: "parent",
    header: "Parent",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.parent?.name || "None"}
      </span>
    ),
  },
  {
    id: "status",
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => <DateCell date={row.original.createdAt} />,
  },
];
