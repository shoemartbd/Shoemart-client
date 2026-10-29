import DateCell from "@/components/shared/cell/DateCell";
import { Badge } from "@/components/ui/badge";
import { IUser } from "@/types/user.types";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "lucide-react";
import Image from "next/image";

export const userColumns: ColumnDef<IUser>[] = [
  {
    id: "image",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full border">
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
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    id: "role",
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.role.toLowerCase().replace("_", " ")}
      </Badge>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === "ACTIVE"
              ? "default"
              : status === "BLOCKED"
              ? "destructive"
              : "secondary"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "emailVerified",
    header: "Verified",
    cell: ({ row }) => (
      <Badge variant={row.original.emailVerified ? "outline" : "secondary"}>
        {row.original.emailVerified ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => <DateCell date={row.original.createdAt} />,
  },
];
