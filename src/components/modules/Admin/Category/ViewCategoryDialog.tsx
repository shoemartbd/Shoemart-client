"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ICategory } from "@/types/category.types";
import { format } from "date-fns";
import Image from "next/image";
import { Plus } from "lucide-react";

interface ViewCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ICategory | null;
}

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "N/A";
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return "N/A";
  return format(dateValue, "MMM dd, yyyy hh:mm a");
};

const ViewCategoryDialog = ({
  open,
  onOpenChange,
  category,
}: ViewCategoryDialogProps) => {
  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-3xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Category Details</DialogTitle>
          <DialogDescription>
            Detailed information about the category and its assets.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="space-y-6 px-6 py-5">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column: Images */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Banner Image</h3>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted shadow-sm">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Slug: {category.slug}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status</h3>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Parent Category</h3>
                    <p className="text-sm text-foreground/80">
                      {category.parent?.name || "None (Root)"}
                    </p>
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm"><span className="font-medium text-muted-foreground">Added On:</span> {formatDateTime(category.createdAt)}</p>
                    <p className="text-sm"><span className="font-medium text-muted-foreground">Last Updated:</span> {formatDateTime(category.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCategoryDialog;
