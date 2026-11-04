"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Loader2, Pencil, Phone, Search, Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteWholesaleRequest,
  getWholesaleRequests,
  IWholesaleRequest,
  updateWholesaleRequest,
  WholesaleRequestStatus,
} from "@/services/wholesaleRequest.services";
import { wholesaleInvoiceNo } from "@/lib/printWholesaleInvoice";
import { cn } from "@/lib/utils";
import { confirmAction } from "@/lib/confirmAction";
import WholesaleRequestEditor from "./WholesaleRequestEditor";
import { STATUSES, StatusSelect, statusOf, whatsappHref } from "./wholesaleStatus";

const taka = (n: number) =>
  `৳${(Number(n) || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export default function WholesaleRequestsView() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<WholesaleRequestStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<IWholesaleRequest | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["wholesale-requests", tab, debounced],
    queryFn: () =>
      getWholesaleRequests({
        status: tab === "ALL" ? undefined : tab,
        searchTerm: debounced || undefined,
      }),
  });
  const rows = data?.data ?? [];
  const summary = data?.summary;
  const total = summary ? Object.values(summary).reduce((a, b) => a + b, 0) : 0;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["wholesale-requests"] });
    void queryClient.invalidateQueries({ queryKey: ["wholesale-report"] });
  };

  const changeStatus = async (row: IWholesaleRequest, status: WholesaleRequestStatus) => {
    setBusyId(row.id);
    try {
      await updateWholesaleRequest(row.id, { status });
      toast.success(`Marked as ${statusOf(status).label}`);
      refresh();
    } catch (error) {
      toast.error((error as Error).message || "Failed to update");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (row: IWholesaleRequest) => {
    const ok = await confirmAction({
      title: `Delete request from ${row.name}?`,
      text:
        row.status === "COMPLETED"
          ? "This sale will also be removed from the wholesale report. This can't be undone."
          : "This can't be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;
    setBusyId(row.id);
    try {
      await deleteWholesaleRequest(row.id);
      toast.success("Request deleted");
      if (editing?.id === row.id) setEditing(null);
      refresh();
    } catch (error) {
      toast.error((error as Error).message || "Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  const tabs: { value: WholesaleRequestStatus | "ALL"; label: string; count?: number }[] = [
    { value: "ALL", label: "All", count: summary ? total : undefined },
    ...STATUSES.map((s) => ({ value: s.value, label: s.label, count: summary?.[s.value] })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Wholesale Requests</h3>
          <p className="text-muted-foreground">
            Bulk orders from the{" "}
            <Link href="/wholesale" target="_blank" className="font-medium text-primary underline">
              wholesale page
            </Link>
            . Open one to edit products, pairs and prices, print the invoice and mark the sale
            complete.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/dashboard/wholesale-report">Wholesale Report</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                tab === t.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted",
              )}
            >
              {t.label}
              {t.count !== undefined && <span className="ml-1.5 opacity-70">{t.count}</span>}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, business or invoice no"
            className="h-10 rounded-full pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <Boxes className="size-10 text-muted-foreground/50" />
            <p className="font-semibold">{debounced ? "No match" : "No wholesale requests yet"}</p>
            <p className="text-sm text-muted-foreground">
              {debounced
                ? "Try another search."
                : "Requests from the wholesale page will show up here."}
            </p>
          </div>
        ) : (
          <div className={cn("overflow-x-auto", isFetching && "opacity-60")}>
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Invoice</th>
                  <th className="px-4 py-3 font-semibold">Buyer</th>
                  <th className="px-4 py-3 font-semibold">Business</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Received</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b align-top last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">
                      {wholesaleInvoiceNo(row.invoiceNo)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{row.name}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs">
                        <a href={`tel:${row.phone}`} className="flex items-center gap-1 font-mono hover:text-primary">
                          <Phone className="size-3" /> {row.phone}
                        </a>
                        <a
                          href={whatsappHref(row.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${row.name}`}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          <FaWhatsapp className="size-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.businessName || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {[row.businessType, row.location].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {row.products.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setEditing(row)}
                          className="text-left hover:text-primary"
                        >
                          <p className="font-semibold">
                            {row.products.length} product{row.products.length === 1 ? "" : "s"} ·{" "}
                            {row.totals.pairs} pairs
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {row.totals.subtotal > 0
                              ? `Total ${taka(row.totals.total)}`
                              : "Price not set yet"}
                          </p>
                        </button>
                      ) : (
                        <span className="text-muted-foreground">No products</span>
                      )}
                      {row.categories.length > 0 && (
                        <p className="mt-1 max-w-[220px] truncate text-xs text-muted-foreground">
                          {row.categories.join(", ")}
                        </p>
                      )}
                      {row.quantity && <p className="mt-0.5 text-xs">{row.quantity}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {format(new Date(row.createdAt), "d MMM yyyy, h:mm a")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect
                        value={row.status}
                        disabled={busyId === row.id}
                        onChange={(status) => changeStatus(row, status)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing(row)} className="gap-1.5">
                          <Pencil className="size-3.5" /> Manage
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={busyId === row.id}
                          onClick={() => handleDelete(row)}
                          aria-label="Delete request"
                          className="size-8 text-destructive hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <WholesaleRequestEditor
          key={`${editing.id}-${editing.updatedAt}`}
          request={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setEditing(updated);
            refresh();
          }}
        />
      )}
    </div>
  );
}
