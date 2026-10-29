"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarRange, FileSpreadsheet, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportOrders } from "@/services/order.services";
import { IOrder } from "@/types/order.types";

const PAYMENT_LABEL: Record<string, string> = {
  COD: "Cash on Delivery",
  BKASH: "bKash",
  SSLCOMMERZ: "Online (SSLCommerz)",
  cash: "Cash",
  card: "Card",
  mfs: "Mobile Banking",
  other: "Other",
};

// One spreadsheet row per order
const toRow = (order: IOrder) => {
  const items = order.items ?? [];
  const subtotal = items.reduce(
    (sum, i) => sum + i.price * (i.quantity - (i.returnedQuantity || 0)),
    0,
  );
  return {
    "Order No": order.orderNumber,
    Date: format(new Date(order.createdAt), "yyyy-MM-dd HH:mm"),
    Type: order.orderType.replace("_", " "),
    Customer: order.fullName,
    Phone: order.phone,
    Email: order.user?.email ?? "",
    Address: order.address,
    District: order.district,
    Products: items
      .map(
        (i) =>
          `${i.product?.name ?? "Deleted product"}${
            i.productVariant?.combination ? ` (${i.productVariant.combination})` : ""
          } x${i.quantity}`,
      )
      .join("; "),
    "Total Qty": items.reduce((n, i) => n + i.quantity, 0),
    Subtotal: subtotal,
    Shipping: order.shippingFee || 0,
    Discount: order.discountAmount || 0,
    Total: order.totalAmount,
    "Payment Method": PAYMENT_LABEL[order.paymentMethod ?? ""] ?? order.paymentMethod ?? "",
    "Payment Status": order.paymentStatus,
    "Order Status": order.orderStatus,
    Courier: order.courierProvider ?? "",
    "Tracking Code": order.courierTrackingCode || order.courierConsignmentId || "",
    Notes: order.notes ?? "",
  };
};

interface OrderToolbarProps {
  from: string;
  to: string;
  onDateChange: (from: string, to: string) => void;
  // The list's current filters (status, search, dates, type)
  exportParams: Record<string, string>;
  fileLabel: string;
}

export default function OrderToolbar({
  from,
  to,
  onDateChange,
  exportParams,
  fileLabel,
}: OrderToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = { ...exportParams };
      delete params.page;
      delete params.limit;
      const res = await exportOrders(params);
      if (!res?.success) throw new Error(res?.message || "Export failed");

      const { orders, total, limit } = res.data as {
        orders: IOrder[];
        total: number;
        limit: number;
      };
      if (orders.length === 0) {
        toast.info("No orders match these filters");
        return;
      }

      // Loaded only when needed, keeps the orders page light
      const XLSX = await import("xlsx");
      const sheet = XLSX.utils.json_to_sheet(orders.map(toRow));
      sheet["!cols"] = [
        { wch: 14 }, { wch: 17 }, { wch: 12 }, { wch: 22 }, { wch: 14 },
        { wch: 26 }, { wch: 36 }, { wch: 14 }, { wch: 50 }, { wch: 9 },
        { wch: 10 }, { wch: 9 }, { wch: 9 }, { wch: 10 }, { wch: 18 },
        { wch: 14 }, { wch: 13 }, { wch: 11 }, { wch: 16 }, { wch: 30 },
      ];
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, "Orders");
      const range = from || to ? `-${from || "start"}-to-${to || "today"}` : "";
      XLSX.writeFile(book, `${fileLabel}${range}-${format(new Date(), "yyyyMMdd-HHmm")}.xlsx`);

      toast.success(
        total > limit
          ? `Exported the newest ${limit} of ${total} orders. Narrow the dates to get the rest.`
          : `Exported ${orders.length} orders`,
      );
    } catch (error: any) {
      toast.error(error.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-lg border bg-background px-2">
        <CalendarRange className="size-4 shrink-0 text-muted-foreground" />
        <Input
          type="date"
          aria-label="From date"
          value={from}
          max={to || undefined}
          onChange={(e) => onDateChange(e.target.value, to)}
          className="h-9 w-[8.5rem] border-0 px-1 shadow-none focus-visible:ring-0"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="date"
          aria-label="To date"
          value={to}
          min={from || undefined}
          onChange={(e) => onDateChange(from, e.target.value)}
          className="h-9 w-[8.5rem] border-0 px-1 shadow-none focus-visible:ring-0"
        />
        {(from || to) && (
          <button
            type="button"
            onClick={() => onDateChange("", "")}
            aria-label="Clear dates"
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <Button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="h-10 gap-2 rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
      >
        {isExporting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="size-4" />
        )}
        Export Excel
      </Button>
    </div>
  );
}
