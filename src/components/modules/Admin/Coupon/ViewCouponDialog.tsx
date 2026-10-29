"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ICoupon } from "@/types/coupon.types";
import { Calendar, Tag } from "lucide-react";

interface ViewCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: ICoupon | null;
}

const ViewCouponDialog = ({
  open,
  onOpenChange,
  coupon,
}: ViewCouponDialogProps) => {
  if (!coupon) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Tag className="size-5 text-primary" />
            Coupon Details
          </DialogTitle>
          <DialogDescription>
            Detailed view of the selected coupon and its applicable products.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 rounded-xl border p-4 bg-muted/20">
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">Coupon Code</span>
              <span className="font-bold tracking-wider text-primary text-lg">{coupon.code}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">Status</span>
              <Badge variant={coupon.isActive ? "default" : "secondary"}>
                {coupon.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">Discount</span>
              <span className="font-semibold text-foreground">
                {coupon.discountType === "PERCENTAGE"
                  ? `${coupon.discountAmount}% Off`
                  : `৳${coupon.discountAmount} Flat`}
              </span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-0.5">Min Purchase</span>
              <span className="font-semibold text-foreground">৳{coupon.minPurchaseAmount}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold flex items-center gap-1.5">
              <Calendar className="size-4 text-primary" />
              Validity Period
            </span>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border p-2.5 bg-background">
                <span className="text-xs text-muted-foreground block">Start Date</span>
                <span className="font-medium text-xs">{formatDate(coupon.startDate)}</span>
              </div>
              <div className="rounded-lg border p-2.5 bg-background">
                <span className="text-xs text-muted-foreground block">End Date</span>
                <span className="font-medium text-xs">{formatDate(coupon.endDate)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold block">
              Applicable Products ({coupon.products?.length || 0})
            </span>
            <div className="rounded-lg border bg-background">
              <ScrollArea className="h-44">
                <div className="p-3 space-y-2">
                  {coupon.products && coupon.products.length > 0 ? (
                    coupon.products.map((cp) => {
                      const p = (cp as any).product || cp; // Handle backend structure nesting or client model
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-md p-2 hover:bg-muted/30 transition-colors border-b last:border-0"
                        >
                          <span className="text-sm font-medium">{p.name}</span>
                          <span className="text-xs text-muted-foreground">ID: {p.id.slice(0, 8)}...</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No products mapped.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t p-4 bg-muted/10">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCouponDialog;
