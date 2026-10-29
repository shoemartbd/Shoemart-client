"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllOrders } from "@/services/order.services";
import { processOrderReturn } from "@/services/orderReturn.services";
import { IOrder } from "@/types/order.types";
import { cn } from "@/lib/utils";

const money = (value: number) =>
  `৳${(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const returnableQty = (item: IOrder["items"][number]) =>
  item.quantity - (item.returnedQuantity || 0);

// Only delivered orders can be returned (POS sales are delivered on the spot)
export const canReturnOrder = (order: IOrder) =>
  order.orderStatus === "DELIVERED" &&
  (order.items ?? []).some((item) => returnableQty(item) > 0);

interface ProcessReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Given = start straight at choosing items; omitted = search for the order first
  order?: IOrder | null;
}

export default function ProcessReturnDialog({
  open,
  onOpenChange,
  order: initialOrder = null,
}: ProcessReturnDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [order, setOrder] = useState<IOrder | null>(initialOrder);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: searchResponse, isFetching: isSearching } = useQuery({
    queryKey: ["orders", "return-search", debounced],
    queryFn: () => getAllOrders({ searchTerm: debounced, limit: "8" }),
    enabled: open && !order && debounced.length >= 2,
  });
  const results: IOrder[] = searchResponse?.data ?? [];

  const items = order?.items ?? [];
  const selected = items.filter((item) => (quantities[item.id] ?? 0) > 0);
  const refundTotal = selected.reduce(
    (sum, item) => sum + item.price * quantities[item.id],
    0,
  );

  const pickOrder = (picked: IOrder) => {
    setOrder(picked);
    setQuantities({});
  };

  const setQty = (itemId: string, value: number, max: number) =>
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(max, Math.floor(value) || 0)),
    }));

  const handleSubmit = async () => {
    if (!order || selected.length === 0) return;
    setIsSaving(true);
    try {
      const res = await processOrderReturn({
        orderId: order.id,
        items: selected.map((item) => ({
          orderItemId: item.id,
          quantity: quantities[item.id],
        })),
      });
      if (res?.success) {
        toast.success(`Return saved — refund ${money(refundTotal)}, stock updated`);
        void queryClient.invalidateQueries({ queryKey: ["orders"] });
        void queryClient.invalidateQueries({ queryKey: ["order-returns"] });
        router.refresh();
        onOpenChange(false);
      } else {
        toast.error(res?.message || "Failed to process return");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <RotateCcw className="size-5 text-destructive" />
            Return Products
          </DialogTitle>
          <DialogDescription>
            {order
              ? "Set how many of each product came back. Stock is added back automatically."
              : "Step 1: find the order by order number, customer name or phone."}
          </DialogDescription>
        </DialogHeader>

        {!order ? (
          /* Step 1: find the order */
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. ONL-000123 or 01XXXXXXXXX"
                className="h-11 rounded-xl pl-9"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            {debounced.length >= 2 && !isSearching && results.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No orders found.
              </p>
            )}

            <ul className="space-y-2">
              {results.map((result) => {
                const allowed = canReturnOrder(result);
                return (
                  <li key={result.id}>
                    <button
                      type="button"
                      disabled={!allowed}
                      onClick={() => pickOrder(result)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors",
                        allowed
                          ? "hover:border-primary/50 hover:bg-primary/5"
                          : "cursor-not-allowed opacity-60",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-bold">
                          {result.orderNumber}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {result.fullName} · {result.phone} ·{" "}
                          {format(new Date(result.createdAt), "d MMM yyyy")}
                        </p>
                        {!allowed && (
                          <p className="mt-0.5 text-[11px] font-medium text-destructive">
                            {result.orderStatus !== "DELIVERED"
                              ? "Only delivered orders can be returned"
                              : "Everything already returned"}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-sm font-bold">
                          {money(result.totalAmount)}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {result.orderStatus.replace("_", " ")}
                        </Badge>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          /* Step 2: choose items and quantities */
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold">{order.orderNumber}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {order.fullName} · {order.phone}
                </p>
              </div>
              {!initialOrder && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1"
                  onClick={() => setOrder(null)}
                >
                  <ArrowLeft className="size-4" />
                  Change order
                </Button>
              )}
            </div>

            <ul className="space-y-2">
              {items.map((item) => {
                const max = returnableQty(item);
                const qty = quantities[item.id] ?? 0;
                const image = item.productVariant?.image || item.product?.images?.[0];
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3",
                      qty > 0 && "border-destructive/50 bg-destructive/5",
                      max === 0 && "opacity-50",
                    )}
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      {image ? (
                        <Image src={image} alt="" fill sizes="48px" className="object-cover" />
                      ) : (
                        <Package className="m-auto mt-3.5 size-5 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.productVariant?.combination &&
                          `${item.productVariant.combination} · `}
                        {money(item.price)} each · ordered {item.quantity}
                        {item.returnedQuantity > 0 &&
                          `, ${item.returnedQuantity} already returned`}
                      </p>
                    </div>
                    {max > 0 ? (
                      <div className="flex shrink-0 items-center rounded-full border">
                        <button
                          type="button"
                          aria-label="Less"
                          onClick={() => setQty(item.id, qty - 1, max)}
                          disabled={qty <= 0}
                          className="p-2 disabled:opacity-30"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={max}
                          value={qty}
                          onChange={(e) => setQty(item.id, Number(e.target.value), max)}
                          aria-label={`Return quantity, up to ${max}`}
                          className="w-9 bg-transparent text-center text-sm font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          aria-label="More"
                          onClick={() => setQty(item.id, qty + 1, max)}
                          disabled={qty >= max}
                          className="p-2 disabled:opacity-30"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        Returned
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between rounded-xl border p-4">
              <span className="text-sm text-muted-foreground">
                Refund ({selected.reduce((n, i) => n + quantities[i.id], 0)} items)
              </span>
              <span className="text-lg font-black text-destructive">
                {money(refundTotal)}
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1 rounded-xl font-bold"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="h-11 flex-1 gap-2 rounded-xl font-bold"
                disabled={selected.length === 0 || isSaving}
                onClick={handleSubmit}
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RotateCcw className="size-4" />
                )}
                Confirm Return
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

