"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Loader2, Printer, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BulkOrderResult,
  BulkOrderUpdate,
  bulkDeleteOrders,
  bulkUpdateOrders,
} from "@/services/order.services";
import { confirmAction } from "@/lib/confirmAction";
import { printOrdersBulk } from "@/lib/printOrderInvoice";
import { getSiteSettings } from "@/services/siteSetting.services";
import { IOrder } from "@/types/order.types";
import { usePermissions } from "@/providers/PermissionProvider";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_COURIER", label: "In Courier" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PAYMENT_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

// RedX needs a delivery area per order, so it stays on the single-order screen
const COURIER_OPTIONS = [
  { value: "PATHAO", label: "Pathao" },
  { value: "STEADFAST", label: "Steadfast" },
] as const;

// Shown above the order list while orders are selected
export default function OrderBulkActions({
  selectedOrders,
  onClear,
}: {
  selectedOrders: IOrder[];
  onClear: () => void;
}) {
  const selectedIds = selectedOrders.map((o) => o.id);
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const [busy, setBusy] = useState<string | null>(null);
  const count = selectedIds.length;
  if (count === 0) return null;

  const plural = count === 1 ? "order" : "orders";

  const report = (result: { success: boolean; message: string; data?: BulkOrderResult }) => {
    if (!result.success || !result.data) {
      toast.error(result.message || "Something went wrong");
      return;
    }
    const { succeeded, failed } = result.data;
    if (succeeded) toast.success(result.message);
    if (failed.length) {
      const lines = failed
        .slice(0, 4)
        .map((f) => `#${f.orderNumber}: ${f.message}`)
        .join("\n");
      toast.error(`${failed.length} ${failed.length === 1 ? "order" : "orders"} failed`, {
        description: failed.length > 4 ? `${lines}\n…and ${failed.length - 4} more` : lines,
        duration: 10000,
      });
    }
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
    onClear();
  };

  const run = async (key: string, confirmTitle: string, update: BulkOrderUpdate) => {
    const ok = await confirmAction({
      title: confirmTitle,
      confirmText: "Yes, update",
      variant: "primary",
      icon: "question",
    });
    if (!ok) return;
    setBusy(key);
    try {
      report(await bulkUpdateOrders(selectedIds, update));
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmAction({
      title: `Delete ${count} ${plural}?`,
      text: "This can't be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;
    setBusy("delete");
    try {
      report(await bulkDeleteOrders(selectedIds));
    } finally {
      setBusy(null);
    }
  };

  // One print job, one order per A4 sheet; company details load once
  const handlePrint = async () => {
    setBusy("print");
    try {
      const siteSettings = await queryClient
        .fetchQuery({
          queryKey: ["site-settings"],
          queryFn: () => getSiteSettings().then((res) => res.data),
          staleTime: 10 * 60 * 1000,
        })
        .catch(() => null);
      printOrdersBulk(selectedOrders, siteSettings);
    } finally {
      setBusy(null);
    }
  };

  const labelOf = (list: readonly { value: string; label: string }[], value: string) =>
    list.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 lg:flex-row lg:items-center">
      <div className="flex items-center gap-2 font-semibold">
        <CheckSquare className="size-4 text-primary" />
        {count} {plural} selected
        {busy && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
        <Button
          size="sm"
          variant="outline"
          disabled={Boolean(busy)}
          onClick={handlePrint}
          className="h-9 gap-1.5 bg-background"
        >
          <Printer className="size-4" /> Print Invoice
        </Button>

        {can("order.update") && (
          <>
            <Select
              value=""
              disabled={Boolean(busy)}
              onValueChange={(v) =>
                run("status", `Mark ${count} ${plural} as ${labelOf(STATUS_OPTIONS, v)}?`, {
                  action: "status",
                  status: v,
                })
              }
            >
              <SelectTrigger className="h-9 w-40 bg-background">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value=""
              disabled={Boolean(busy)}
              onValueChange={(v) =>
                run("payment", `Set payment of ${count} ${plural} to ${labelOf(PAYMENT_OPTIONS, v)}?`, {
                  action: "payment",
                  paymentStatus: v,
                })
              }
            >
              <SelectTrigger className="h-9 w-52 bg-background">
                <SelectValue placeholder="Change Payment Status" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value=""
              disabled={Boolean(busy)}
              onValueChange={(v) =>
                run(
                  "courier",
                  `Send ${count} ${plural} to ${labelOf(COURIER_OPTIONS, v)}? They will move to In Courier.`,
                  { action: "courier", provider: v as "PATHAO" | "STEADFAST" },
                )
              }
            >
              <SelectTrigger className="h-9 w-40 bg-background">
                <SelectValue placeholder="Assign Courier" />
              </SelectTrigger>
              <SelectContent>
                {COURIER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {can("order.delete") && (
          <Button
            size="sm"
            variant="destructive"
            disabled={Boolean(busy)}
            onClick={handleDelete}
            className="h-9 gap-1.5"
          >
            <Trash2 className="size-4" /> Delete
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          disabled={Boolean(busy)}
          className="h-9 gap-1.5"
        >
          <X className="size-4" /> Clear
        </Button>
      </div>
    </div>
  );
}
