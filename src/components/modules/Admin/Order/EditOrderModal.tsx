"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IOrder, IOrderItem, OrderStatus, PaymentStatus } from "@/types/order.types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Pencil, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  updateOrderStatus,
  updateOrderDiscount,
  updateOrderPaymentStatus,
  assignCourier,
} from "@/services/order.services";
import { getCourierSettings } from "@/services/courierSetting.services";
import { COURIER_LABEL, CourierProvider } from "@/types/order.types";
import RedxAreaPicker from "./RedxAreaPicker";
import EditOrderItemModal from "./EditOrderItemModal";

interface EditOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: IOrder | null;
}

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_COURIER",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

export default function EditOrderModal({
  open,
  onOpenChange,
  order,
}: EditOrderModalProps) {
  const [status, setStatus] = useState<OrderStatus>(order?.orderStatus ?? "PENDING");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    order?.paymentStatus ?? "PENDING",
  );
  const [discountInput, setDiscountInput] = useState<string>(
    String(order?.discountAmount ?? 0),
  );
  const [loading, setLoading] = useState(false);

  const [editingItem, setEditingItem] = useState<IOrderItem | null>(null);
  const [isItemEditOpen, setIsItemEditOpen] = useState(false);

  const [assigningProvider, setAssigningProvider] = useState<
    "PATHAO" | "STEADFAST" | "REDX" | null
  >(null);
  const [localCourier, setLocalCourier] = useState<{
    courierProvider: string;
    courierTrackingCode?: string | null;
    courierConsignmentId?: string | null;
    courierStatus?: string | null;
  } | null>(null);

  const [enabledCouriers, setEnabledCouriers] = useState<{
    pathao: boolean;
    steadfast: boolean;
    redx: boolean;
  } | null>(null);
  // RedX needs a delivery area, picked before sending
  const [isPickingRedxArea, setIsPickingRedxArea] = useState(false);

  useEffect(() => {
    if (!open) return;
    getCourierSettings()
      .then((res) => {
        if (res.data) {
          setEnabledCouriers({
            pathao: res.data.pathaoEnabled,
            steadfast: res.data.steadfastEnabled,
            redx: Boolean(res.data.redxEnabled),
          });
        }
      })
      .catch(() => setEnabledCouriers({ pathao: false, steadfast: false, redx: false }));
  }, [open]);

  if (!order) return null;

  const courierInfo = localCourier ?? order;
  const isCourierAssigned = Boolean(courierInfo.courierProvider);

  const handleAssignCourier = async (
    provider: "PATHAO" | "STEADFAST" | "REDX",
    redxArea?: { id: number; name: string },
  ) => {
    setAssigningProvider(provider);
    try {
      const res = await assignCourier(order.id, provider, redxArea);
      if (res.success) {
        setLocalCourier(res.data);
        setIsPickingRedxArea(false);
        toast.success(`Order assigned to ${COURIER_LABEL[provider]}`);
      } else {
        toast.error(res.message || "Failed to assign courier");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setAssigningProvider(null);
    }
  };

  const discountAmount = Math.max(0, Number(discountInput) || 0);
  const statusChanged = status !== order.orderStatus;
  const paymentStatusChanged = paymentStatus !== order.paymentStatus;
  const discountChanged = discountAmount !== order.discountAmount;
  const canSave = statusChanged || paymentStatusChanged || discountChanged;

  const handleSave = async () => {
    setLoading(true);
    try {
      if (statusChanged) {
        const res = await updateOrderStatus(order.id, status);
        if (!res.success) {
          toast.error(res.message || "Failed to update status");
          setLoading(false);
          return;
        }
      }

      if (paymentStatusChanged) {
        const res = await updateOrderPaymentStatus(order.id, paymentStatus);
        if (!res.success) {
          toast.error(res.message || "Failed to update payment status");
          setLoading(false);
          return;
        }
      }

      if (discountChanged) {
        const res = await updateOrderDiscount(order.id, discountAmount);
        if (!res.success) {
          toast.error(res.message || "Failed to update discount");
          setLoading(false);
          return;
        }
      }

      toast.success("Order updated successfully");
      onOpenChange(false);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">Edit Order</DialogTitle>
            <DialogDescription>
              Order No: {order.orderNumber || order.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <Label>Order Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as OrderStatus)}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select
                value={paymentStatus}
                onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Discount Amount (৳)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="h-12 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Manually adjust the discount applied to this order&apos;s total.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Truck className="size-3.5" /> Courier
              </Label>
              {isCourierAssigned ? (
                <div className="flex items-center justify-between rounded-xl border bg-card p-3">
                  <div>
                    <Badge className="font-semibold">
                      {COURIER_LABEL[courierInfo.courierProvider as CourierProvider] ??
                        courierInfo.courierProvider}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {courierInfo.courierTrackingCode || courierInfo.courierConsignmentId
                        ? `Tracking: ${courierInfo.courierTrackingCode || courierInfo.courierConsignmentId}`
                        : "Assigned"}
                      {courierInfo.courierStatus ? ` · ${courierInfo.courierStatus}` : ""}
                    </p>
                  </div>
                </div>
              ) : !enabledCouriers ? (
                <p className="text-xs text-muted-foreground">Loading courier options...</p>
              ) : !enabledCouriers.pathao && !enabledCouriers.steadfast && !enabledCouriers.redx ? (
                <p className="text-xs text-muted-foreground">
                  No courier is active. Enable one from Courier Settings.
                </p>
              ) : isPickingRedxArea ? (
                <RedxAreaPicker
                  district={order.district || ""}
                  assigning={assigningProvider === "REDX"}
                  onAssign={(area) => handleAssignCourier("REDX", area)}
                  onCancel={() => setIsPickingRedxArea(false)}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {enabledCouriers.pathao && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-xl font-semibold"
                      disabled={assigningProvider !== null}
                      onClick={() => handleAssignCourier("PATHAO")}
                    >
                      {assigningProvider === "PATHAO" ? "Assigning..." : "Assign to Pathao"}
                    </Button>
                  )}
                  {enabledCouriers.steadfast && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-xl font-semibold"
                      disabled={assigningProvider !== null}
                      onClick={() => handleAssignCourier("STEADFAST")}
                    >
                      {assigningProvider === "STEADFAST" ? "Assigning..." : "Assign to Steadfast"}
                    </Button>
                  )}
                  {enabledCouriers.redx && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-xl font-semibold"
                      disabled={assigningProvider !== null}
                      onClick={() => setIsPickingRedxArea(true)}
                    >
                      Assign to RedX
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Order Items ({order.items?.length || 0})</Label>
              <div className="space-y-2">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border bg-card p-2.5"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border">
                      <Image
                        src={item.product?.images?.[0] || "/placeholder.png"}
                        alt={item.product?.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.product?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} · ৳{item.price.toFixed(2)} each
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9 shrink-0 rounded-lg"
                      onClick={() => {
                        setEditingItem(item);
                        setIsItemEditOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl font-bold"
              onClick={handleSave}
              disabled={loading || !canSave}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditOrderItemModal
        key={editingItem?.id ?? "none"}
        open={isItemEditOpen}
        onOpenChange={setIsItemEditOpen}
        item={editingItem ? { ...editingItem, order } : null}
      />
    </>
  );
}
