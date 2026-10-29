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
import { IProduct } from "./productColumns";
import { format } from "date-fns";
import Image from "next/image";
import { Package } from "lucide-react";

interface ViewProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: IProduct | null;
}

const formatDateTime = (value?: string | Date | null) => {
  if (!value) return "N/A";
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) return "N/A";
  return format(dateValue, "MMM dd, yyyy hh:mm a");
};

const ViewProductDialog = ({
  open,
  onOpenChange,
  product,
}: ViewProductDialogProps) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-3xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>
            Detailed information about the product.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="space-y-6 px-6 py-5">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column: Images */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Main Image</h3>
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted shadow-sm">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Other Images</h3>
                    <div className="flex gap-2 flex-wrap">
                      {product.images.slice(1).map((img, index) => (
                        <div key={index} className="relative aspect-square w-20 overflow-hidden rounded-lg border bg-muted shadow-sm">
                          <Image src={img} alt={`${product.name} ${index + 1}`} fill sizes="80px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Metadata */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{product.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.category?.name || "Uncategorized"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status</h3>
                    <Badge variant="outline">
                      {product.status || "ACTIVE"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pricing</h3>
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold text-primary">
                        ৳{product.sellPrice?.toFixed(2)}
                      </span>
                      {product.regularPrice > product.sellPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ৳{product.regularPrice?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Stock</h3>
                    <Badge
                      variant="outline"
                      className={product.stock > 0 ? "bg-blue-500/10 text-blue-600" : "bg-red-500/10 text-red-600"}
                    >
                      {product.stock} in stock
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Description</h3>
                    {product.shortDescription ? (
                      <div
                        className="text-sm text-foreground/80 [&>p]:mb-1 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>strong]:font-bold"
                        dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                      />
                    ) : (
                      <p className="text-sm text-foreground/80">No description provided.</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm"><span className="font-medium text-muted-foreground">Added On:</span> {formatDateTime(product.createdAt)}</p>
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

export default ViewProductDialog;
