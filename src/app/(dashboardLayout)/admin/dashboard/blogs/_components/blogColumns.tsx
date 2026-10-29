import DateCell from "@/components/shared/cell/DateCell";
import { Badge } from "@/components/ui/badge";
import { IBlog } from "@/types/blog.types";
import { ColumnDef } from "@tanstack/react-table";
import { Newspaper } from "lucide-react";
import Image from "next/image";

export const blogColumns: ColumnDef<IBlog>[] = [
  {
    id: "coverImage",
    header: "Cover",
    cell: ({ row }) => (
      <div className="relative h-10 w-10 overflow-hidden rounded-md border">
        {row.original.coverImage ? (
          <Image
            src={row.original.coverImage}
            alt={row.original.title}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    ),
  },
  {
    id: "title",
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.title}</span>
        <span className="text-xs text-muted-foreground">{row.original.slug}</span>
      </div>
    ),
  },
  {
    id: "status",
    accessorKey: "isPublished",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isPublished ? "default" : "secondary"}>
        {row.original.isPublished ? "Published" : "Draft"}
      </Badge>
    ),
  },
  {
    id: "author",
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.author || "—"}
      </span>
    ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => <DateCell date={row.original.createdAt} />,
  },
];
