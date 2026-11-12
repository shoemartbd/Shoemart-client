"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Boxes, ChevronRight, Loader2, Printer, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { printWholesaleInvoice, wholesaleInvoiceNo } from "@/lib/printWholesaleInvoice";
import { getSiteSettings } from "@/services/siteSetting.services";
import {
  getMyWholesaleRequests,
  IMyWholesaleRequest,
  WholesaleRequestStatus,
} from "@/services/wholesaleRequest.services";

const STATUS: Record<WholesaleRequestStatus, { label: string; tone: string }> = {
  NEW: { label: "Request Sent", tone: "bg-sky-500/10 text-sky-700 dark:text-sky-400" },
  CONTACTED: { label: "In Discussion", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  COMPLETED: { label: "Completed", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  CLOSED: { label: "Closed", tone: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
};

const taka = (n: number) =>
  `৳${(Number(n) || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

// Prices are set by the shop when they quote; until then the invoice waits
const isPriced = (r: IMyWholesaleRequest) =>
  r.products.length > 0 && r.products.every((p) => p.unitPrice > 0);

function StatusBadge({ status }: { status: WholesaleRequestStatus }) {
  const s = STATUS[status] ?? STATUS.NEW;
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", s.tone)}>{s.label}</span>
  );
}

export default function MyWholesaleOrders() {
  const [open, setOpen] = useState<IMyWholesaleRequest | null>(null);

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["my-wholesale-orders"],
    queryFn: () => getMyWholesaleRequests(),
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings().then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  });

  const print = (r: IMyWholesaleRequest) =>
    printWholesaleInvoice(
      {
        invoiceNo: r.invoiceNo,
        date: r.completedAt ?? r.createdAt,
        name: r.name,
        phone: r.phone,
        email: r.email,
        businessName: r.businessName,
        location: r.location,
        lines: r.products,
        deliveryCharge: r.deliveryCharge,
        paidAmount: r.paidAmount,
        completed: r.status === "COMPLETED",
      },
      siteSettings,
    );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        Couldn&apos;t load your wholesale orders. Please log out and in again, then retry.
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
        <Boxes className="size-12 text-muted-foreground/40" />
        <p className="text-lg font-bold">No wholesale orders yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Send a wholesale request while logged in and it shows up here. Orders the shop links
          to your account appear here too.
        </p>
        <Button asChild className="mt-2 rounded-full">
          <Link href="/wholesale">
            <Send className="size-4" /> Send a wholesale request
          </Link>
        </Button>
      </div>
    );
  }

  const totalDue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + Math.max(o.totals.due, 0), 0);
  const completed = orders.filter((o) => o.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ["Total Requests", String(orders.length)],
          ["Completed Orders", String(completed)],
          ["Total Due", taka(totalDue)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Invoice</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Products</th>
              <th className="px-4 py-3 text-right font-semibold">Pairs</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3 text-right font-semibold">Due</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {orders.map((o) => (
              <tr
                key={o.id}
                onClick={() => setOpen(o)}
                className="cursor-pointer border-b last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-mono text-xs font-bold">{wholesaleInvoiceNo(o.invoiceNo)}</td>
                <td className="px-4 py-3">{format(new Date(o.createdAt), "d MMM yyyy")}</td>
                <td className="px-4 py-3">
                  <div className="flex -space-x-2">
                    {o.products.slice(0, 4).map((p, i) =>
                      p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={`${p.productId}-${p.color}-${i}`}
                          src={p.image}
                          alt=""
                          className="size-8 rounded-full border-2 border-card object-cover"
                        />
                      ) : null,
                    )}
                    {o.products.length > 4 && (
                      <span className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold">
                        +{o.products.length - 4}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">{o.totals.pairs}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {isPriced(o) ? taka(o.totals.total) : <span className="text-xs text-muted-foreground">Awaiting quote</span>}
                </td>
                <td className={cn("px-4 py-3 text-right", isPriced(o) && o.totals.due > 0 && "font-semibold text-red-600")}>
                  {isPriced(o) ? taka(o.totals.due) : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  <ChevronRight className="ml-auto size-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(open)} onOpenChange={(v) => !v && setOpen(null)}>
        {open && (
          <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto sm:max-w-3xl" data-lenis-prevent>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                <span className="font-mono">{wholesaleInvoiceNo(open.invoiceNo)}</span>
                <StatusBadge status={open.status} />
              </DialogTitle>
              <DialogDescription>
                Requested {format(new Date(open.createdAt), "d MMM yyyy, h:mm a")}
                {open.completedAt && ` · Completed ${format(new Date(open.completedAt), "d MMM yyyy")}`}
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">Product</th>
                    <th className="px-3 py-2 font-semibold">Colour</th>
                    <th className="px-3 py-2 text-right font-semibold">Pairs</th>
                    <th className="px-3 py-2 text-right font-semibold">Price / Pair</th>
                    <th className="px-3 py-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {open.products.map((p, i) => (
                    <tr key={`${p.productId}-${p.color}-${i}`} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                            {p.image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.image} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[200px] truncate font-medium" title={p.name}>{p.name}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{p.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">{p.color || "—"}</td>
                      <td className="px-3 py-2 text-right">{p.quantity}</td>
                      <td className="px-3 py-2 text-right">
                        {p.unitPrice > 0 ? taka(p.unitPrice) : <span className="text-xs text-muted-foreground">To be quoted</span>}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {p.unitPrice > 0 ? taka(p.unitPrice * p.quantity) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{open.businessName || open.name}</p>
                {open.businessName && <p className="text-muted-foreground">{open.name}</p>}
                <p className="text-muted-foreground">{open.phone}</p>
                {open.location && <p className="text-muted-foreground">{open.location}</p>}
                {open.message && (
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/50 p-2.5 text-xs">{open.message}</p>
                )}
              </div>
              <dl className="space-y-1.5 rounded-xl border bg-muted/30 p-4 text-sm tabular-nums">
                {[
                  ["Total Pairs", String(open.totals.pairs)],
                  ["Subtotal", isPriced(open) ? taka(open.totals.subtotal) : "—"],
                  ["Delivery Charge", taka(open.deliveryCharge)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-1.5 text-base font-bold">
                  <dt>Grand Total</dt>
                  <dd>{isPriced(open) ? taka(open.totals.total) : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Paid</dt>
                  <dd>{taka(open.paidAmount)}</dd>
                </div>
                <div className="flex justify-between font-semibold">
                  <dt>Due</dt>
                  <dd className={isPriced(open) && open.totals.due > 0 ? "text-red-600" : ""}>
                    {isPriced(open) ? taka(open.totals.due) : "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {isPriced(open)
                  ? "Print or save the invoice as PDF from the print window."
                  : "The invoice is ready once our team sets the price for every product."}
              </p>
              <Button onClick={() => print(open)} disabled={!isPriced(open)} className="gap-1.5 rounded-full">
                <Printer className="size-4" /> Print Invoice
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
