import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IAttribute } from "@/types/attribute.types";
import { ColumnDef } from "@tanstack/react-table";
import { Database, Pencil, Trash, X } from "lucide-react";

export const getAttributeColumns = (
  onEdit: (item: IAttribute) => void,
  onAddValue: (item: IAttribute) => void,
  onDelete: (item: IAttribute) => void
): ColumnDef<IAttribute>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-semibold text-foreground text-sm">
        {row.original.name}
      </span>
    ),
  },
  {
    id: "values",
    header: "Values",
    cell: ({ row }) => {
      const values = row.original.values || [];
      return (
        <div className="flex flex-wrap gap-1.5 max-w-xl">
          {values.length > 0 ? (
            values.map((v) => (
              <Badge
                key={v.id}
                variant="secondary"
                className="bg-emerald-600 text-white font-medium px-2.5 py-0.5 rounded border-none"
              >
                {v.value}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">No values added yet</span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-2">
          {/* Edit (Green) */}
          <Button
            type="button"
            size="icon"
            className="h-8 w-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded shadow-sm transition-colors"
            onClick={() => onEdit(item)}
            title="Edit Attribute"
          >
            <Pencil className="size-4" />
          </Button>

          {/* Add Value (Yellow) */}
          <Button
            type="button"
            size="icon"
            className="h-8 w-8 bg-amber-500 hover:bg-amber-600 text-white rounded shadow-sm transition-colors"
            onClick={() => onAddValue(item)}
            title="Add Value"
          >
            <Database className="size-4" />
          </Button>

          {/* Delete (Red) */}
          <Button
            type="button"
            size="icon"
            className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded shadow-sm transition-colors"
            onClick={() => onDelete(item)}
            title="Delete Attribute"
          >
            <Trash className="size-4" />
          </Button>
        </div>
      );
    },
  },
];
