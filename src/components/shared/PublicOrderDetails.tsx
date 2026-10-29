import { IPublicOrder } from "@/types/order.types";
import { Separator } from "@/components/ui/separator";
import OrderStatusTimeline from "@/components/shared/OrderStatusTimeline";
import Image from "next/image";
import { format } from "date-fns";
import { Undo2 } from "lucide-react";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: "Cash on Delivery",
  BKASH: "bKash",
  SSLCOMMERZ: "Online Payment",
};

export default function PublicOrderDetails({ order }: { order: IPublicOrder }) {
  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + item.price * (item.quantity - item.returnedQuantity),
    0,
  );
  const hasReturns = order.items.some((item) => item.returnedQuantity > 0);

  return (
    <div className="bg-card rounded-3xl border shadow-sm p-6 md:p-8 space-y-8">
      {/* Order Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase">Order Number</p>
          <p className="text-lg font-black font-mono">{order.orderNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-muted-foreground uppercase">Placed On</p>
          <p className="font-bold">{format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}</p>
        </div>
      </div>

      {hasReturns && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm font-semibold text-destructive">
          <Undo2 className="size-4 shrink-0" />
          A return has been processed for one or more items in this order.
        </div>
      )}

      <Separator />

      {/* Status Timeline */}
      <div>
        <h2 className="font-black text-lg mb-4">Order Status</h2>
        <OrderStatusTimeline status={order.orderStatus} />
      </div>

      <Separator />

      {/* Items */}
      <div className="space-y-4">
        <h2 className="font-black text-lg">Order Items ({order.items.length})</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 items-center bg-muted/40 p-3 rounded-xl border"
            >
              <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border bg-muted">
                {item.product?.images?.[0] && (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{item.product?.name}</p>
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
              <div className="text-right shrink-0">
                <p className="font-black text-sm">৳{(item.price * item.quantity).toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">৳{item.price.toFixed(2)} each</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Shipping Address */}
      <div className="space-y-2">
        <h2 className="font-black text-lg">Shipping Address</h2>
        <div className="text-sm leading-relaxed text-muted-foreground bg-muted/40 p-4 rounded-xl border">
          <p className="font-semibold text-foreground">{order.fullName} — {order.phone}</p>
          {order.email && <p>{order.email}</p>}
          <p>{order.address}, {order.district}</p>
          {order.notes && (
            <>
              <Separator className="my-2" />
              <span className="block italic">Note: {order.notes}</span>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Summary */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-bold">৳{itemsSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-bold">৳{order.shippingFee.toFixed(2)}</span>
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
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-lg font-black">Total</span>
          <span className="text-xl font-black text-primary">৳{order.totalAmount.toFixed(2)}</span>
        </div>
        <p
          className={
            order.paymentStatus === "PAID"
              ? "text-sm font-semibold text-emerald-600 text-right"
              : "text-xs text-muted-foreground text-right"
          }
        >
          {order.paymentStatus === "PAID"
            ? `✓ Paid via ${PAYMENT_METHOD_LABEL[order.paymentMethod ?? ""] ?? order.paymentMethod}`
            : `Payment: ${PAYMENT_METHOD_LABEL[order.paymentMethod ?? ""] ?? "Cash on Delivery"} (${order.paymentStatus.toLowerCase()})`}
        </p>
      </div>
    </div>
  );
}
