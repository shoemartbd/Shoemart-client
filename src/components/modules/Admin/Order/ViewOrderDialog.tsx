"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IOrder } from "@/types/order.types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ReviewModal from "../../User/Review/ReviewModal";
import { Printer, RotateCcw, Star } from "lucide-react";
import ProcessReturnDialog, {
  canReturnOrder,
} from "../OrderReturn/ProcessReturnDialog";
import { getSiteSettings } from "@/services/siteSetting.services";
import { usePermissions } from "@/providers/PermissionProvider";
import MarkFraudButton from "./MarkFraudButton";
import { printOrderInvoice } from "@/lib/printOrderInvoice";
import CourierFraudReport from "./CourierFraudReport";
import { getReturnsByOrder } from "@/services/orderReturn.services";
import { IOrderReturn } from "@/types/orderReturn.types";
import { useQuery } from "@tanstack/react-query";

interface ViewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: IOrder | null;
  showReview?: boolean;
}

export default function ViewOrderDialog({
  open,
  onOpenChange,
  order,
  showReview = false,
}: ViewOrderDialogProps) {
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const { can } = usePermissions();

  const { data: returnsResponse } = useQuery({
    queryKey: ["order-returns", order?.id],
    queryFn: () => getReturnsByOrder(order!.id),
    enabled: open && !!order,
  });
  const orderReturns: IOrderReturn[] = returnsResponse?.data ?? [];

  // Company name, logo and address for the printed invoice
  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings().then((res) => res.data),
    enabled: open && !showReview,
    staleTime: 10 * 60 * 1000,
  });

  if (!order) return null;

  const handleReviewClick = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName });
    setIsReviewModalOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            Order Details
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Order No: {order.orderNumber || order.id}
          </DialogDescription>
          {/* A4 invoice and returns — admin only */}
          {!showReview && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                size="lg"
                className="h-12 w-full gap-2 rounded-xl text-base font-bold shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 sm:w-fit sm:px-6"
                onClick={() => printOrderInvoice(order, siteSettings)}
              >
                <Printer className="size-5" />
                Print Invoice
                <span className="rounded-md bg-primary-foreground/20 px-1.5 py-0.5 text-[11px] font-semibold">
                  A4
                </span>
              </Button>
              <MarkFraudButton order={order} size="lg" className="w-full sm:w-fit" />
            {canReturnOrder(order) && can("return.manage") && (
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-12 w-full gap-2 rounded-xl border-destructive/40 text-base font-bold text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-fit sm:px-6"
                  onClick={() => setIsReturnOpen(true)}
                >
                  <RotateCcw className="size-5" />
                  Return Items
                </Button>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer & Status Info */}
          <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-2xl">
            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Customer
              </p>
              <p className="font-bold">{order.fullName}</p>
              <p className="text-sm">{order.phone}</p>
              {(order.email || order.user?.email) && (
                <p className="text-sm text-muted-foreground break-all">
                  {order.email || order.user?.email}
                </p>
              )}
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Date
              </p>
              <p className="font-bold">
                {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
              </p>
              <div className="flex justify-end gap-2 mt-1">
                <Badge variant="outline">{order.orderStatus.replace("_", " ")}</Badge>
                <Badge
                  variant={
                    order.paymentStatus === "PAID" ? "default" : "secondary"
                  }
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-2">
            <h3 className="font-black text-lg">Shipping Address</h3>
            <div className="text-sm leading-relaxed text-muted-foreground bg-card p-4 rounded-xl border">
              {[order.address, order.district].filter(Boolean).join(", ") ||
                "No address given"}
            </div>
          </div>

          {order.notes && (
            <div className="space-y-2">
              <h3 className="font-black text-lg">Note</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
                {order.notes}
              </p>
            </div>
          )}

          {/* Courier Fraud Check — admin only, not shown on the customer's own order view */}
          {!showReview && <CourierFraudReport orderId={order.id} open={open} />}

          {/* Items */}
          <div className="space-y-4">
            <h3 className="font-black text-lg">
              Order Items ({order.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-center bg-card p-3 rounded-xl border"
                >
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border">
                    <Image
                      src={item.product?.images?.[0] || "/placeholder.png"}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Quantity: {item.quantity}
                      {item.returnedQuantity > 0 && (
                        <span className="text-destructive font-semibold">
                          {" "}
                          ({item.returnedQuantity} returned)
                        </span>
                      )}
                    </p>
                    {item.productVariant?.combination && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.productVariant.combination.split("-").map((attr, i) => (
                          <span
                            key={i}
                            className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                          >
                            {attr}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-black text-sm">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      ৳{item.price.toFixed(2)} each
                    </p>
                    {showReview && order.orderStatus === "DELIVERED" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white font-black text-[10px] uppercase tracking-widest gap-2 border-none transition-all shadow-sm"
                        onClick={() =>
                          handleReviewClick(
                            item.productId,
                            item.product?.name || "Product",
                          )
                        }
                      >
                        <Star className="size-3 fill-current" />
                        Write Review
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">
                ৳
                {order.items
                  ?.reduce(
                    (acc, item) =>
                      acc + item.price * (item.quantity - item.returnedQuantity),
                    0,
                  )
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-bold">৳{(order.shippingFee || 0).toFixed(2)}</span>
            </div>
            {order.vatAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">VAT</span>
                <span className="font-bold">৳{order.vatAmount.toFixed(2)}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between items-center text-primary">
                <span className="font-medium text-muted-foreground">Discount</span>
                <span className="font-bold">-৳{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                Total
              </span>
              <span className="text-xl font-black text-primary">
                ৳{order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Returned Items */}
          {orderReturns.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-black text-lg text-destructive">Returned Items</h3>
              <div className="rounded-lg border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 font-bold">Product</th>
                      <th className="text-left p-2 font-bold">Variant</th>
                      <th className="text-left p-2 font-bold">Returned Qty</th>
                      <th className="text-left p-2 font-bold">Price</th>
                      <th className="text-left p-2 font-bold">Returned At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderReturns.flatMap((orderReturn) =>
                      orderReturn.items.map((returnItem) => (
                        <tr key={returnItem.id} className="border-b last:border-0">
                          <td className="p-2">{returnItem.product?.name}</td>
                          <td className="p-2 text-muted-foreground">
                            {returnItem.productVariant?.combination || "-"}
                          </td>
                          <td className="p-2 font-bold text-destructive">
                            {returnItem.quantity}
                          </td>
                          <td className="p-2">৳{returnItem.price.toFixed(2)}</td>
                          <td className="p-2 text-muted-foreground">
                            {format(new Date(orderReturn.createdAt), "d MMM, yyyy h:mm a")}
                          </td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {isReturnOpen && (
        <ProcessReturnDialog
          open={isReturnOpen}
          onOpenChange={(next) => {
            setIsReturnOpen(next);
            // Close the details too, so they don't show the pre-return quantities
            if (!next) onOpenChange(false);
          }}
          order={order}
        />
      )}

      {selectedProduct && (
        <ReviewModal
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
        />
      )}
    </Dialog>
  );
}
