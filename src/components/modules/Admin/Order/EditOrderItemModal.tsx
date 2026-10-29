/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getPosProducts } from "@/services/pos.services";
import { updateOrderItem } from "@/services/order.services";
import { processOrderReturn } from "@/services/orderReturn.services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface EditOrderItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any | null;
}

const LOCKED_STATUSES = ["IN_COURIER", "DELIVERED", "CANCELLED"];

export default function EditOrderItemModal({
  open,
  onOpenChange,
  item,
}: EditOrderItemModalProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [productId, setProductId] = useState<string>(item?.productId || "");
  const [productVariantId, setProductVariantId] = useState<string | null>(
    item?.productVariantId || null,
  );
  const [quantity, setQuantity] = useState<number>(item?.quantity || 1);
  const [loading, setLoading] = useState(false);

  const [returnQty, setReturnQty] = useState<number>(0);
  const [returnLoading, setReturnLoading] = useState(false);

  const { data: productsResponse } = useQuery({
    queryKey: ["pos-products", "for-order-edit"],
    queryFn: () => getPosProducts(),
    enabled: open,
  });

  const products: any[] = productsResponse?.data ?? [];

  const orderStatus = item?.order?.orderStatus;
  const isPOS = item?.order?.orderType === "POS";
  const isLocked = !isPOS && orderStatus && !["PENDING", "CONFIRMED"].includes(orderStatus);

  const selectedProduct =
    products.find((p) => p.id === productId) || (item?.product ? { ...item.product, id: item.productId, variants: [] } : null);

  const handleProductChange = (value: string) => {
    setProductId(value);
    const product = products.find((p) => p.id === value);
    if (product?.type === "VARIABLE" && product.variants?.length > 0) {
      setProductVariantId(product.variants[0].id);
    } else {
      setProductVariantId(null);
    }
  };

  const handleUpdate = async () => {
    if (!item || isLocked) {
      onOpenChange(false);
      return;
    }

    const payload: Record<string, unknown> = {};

    if (productId !== item.productId) payload.productId = productId;
    if (productVariantId !== (item.productVariantId || null)) {
      payload.productVariantId = productVariantId;
    }
    if (quantity !== item.quantity) payload.quantity = quantity;

    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }

    setLoading(true);
    try {
      const res = await updateOrderItem(item.id, payload);
      if (res.success) {
        toast.success("Order item updated successfully");
        void queryClient.invalidateQueries({ queryKey: ["orders"] });
        router.refresh();
        onOpenChange(false);
      } else {
        toast.error(res.message || "Failed to update item");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const currentReturnableQty = item ? item.quantity - (item.returnedQuantity || 0) : 0;
  const canReturn = orderStatus === "DELIVERED" && currentReturnableQty > 0;

  const handleProcessReturn = async () => {
    if (!item || returnQty <= 0) return;
    setReturnLoading(true);
    try {
      const res = await processOrderReturn({
        orderId: item.orderId,
        items: [{ orderItemId: item.id, quantity: returnQty }],
      });
      if (res.success) {
        toast.success("Return processed successfully");
        void queryClient.invalidateQueries({ queryKey: ["orders"] });
        void queryClient.invalidateQueries({ queryKey: ["order-returns"] });
        router.refresh();
        setReturnQty(0);
        onOpenChange(false);
      } else {
        toast.error(res.message || "Failed to process return");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setReturnLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Edit Order Item</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {item.product?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {isLocked && (
            <p className="text-xs text-muted-foreground">
              Product/quantity is locked because this order is already{" "}
              {LOCKED_STATUSES.includes(orderStatus) ? orderStatus.toLowerCase() : "reviewed"}.
            </p>
          )}

          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={productId} onValueChange={handleProductChange} disabled={isLocked}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select Product">
                  {selectedProduct?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct?.type === "VARIABLE" && selectedProduct.variants?.length > 0 && (
            <div className="space-y-2">
              <Label>Variant</Label>
              <Select
                value={productVariantId || ""}
                onValueChange={(value) => setProductVariantId(value)}
                disabled={isLocked}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select Variant" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct.variants.map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.combination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              disabled={isLocked}
              className="h-11 rounded-xl"
            />
          </div>

          {canReturn && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Process Return</Label>
                <p className="text-xs text-muted-foreground">
                  Remaining returnable quantity: {currentReturnableQty}
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={currentReturnableQty}
                    value={returnQty}
                    onChange={(e) =>
                      setReturnQty(
                        Math.max(0, Math.min(currentReturnableQty, Number(e.target.value) || 0)),
                      )
                    }
                    className="h-11 rounded-xl"
                  />
                  <Button
                    variant="destructive"
                    className="h-11 rounded-xl font-bold shrink-0"
                    onClick={handleProcessReturn}
                    disabled={returnLoading || returnQty <= 0}
                  >
                    {returnLoading ? "Processing..." : "Process Return"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl font-bold"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          {!isLocked && (
            <Button
              className="flex-1 h-11 rounded-xl font-bold"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
