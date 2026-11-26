"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Download,
  Loader2,
  Printer,
  Search,
  UsersRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatsCard from "@/components/shared/StatsCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { printWholesaleInvoice, wholesaleInvoiceNo } from "@/lib/printWholesaleInvoice";
import { getSiteSettings } from "@/services/siteSetting.services";
import {
  getWholesalerReport,
  IWholesalerReportOrder,
  IWholesalerReportRow,
} from "@/services/wholesaleRequest.services";

type PeriodFilter = "all" | "today" | "week" | "month" | "range";
type SortKey = "name" | "orders" | "pairs" | "total" | "paid" | "due" | "recent" | "open";

const toDateInput = (date: Date) => format(date, "yyyy-MM-dd");

const computeRange = (filter: PeriodFilter, startDate: string, endDate: string) => {
  const now = new Date();
  if (filter === "today") return { startDate: toDateInput(now), endDate: toDateInput(now) };
  if (filter === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { startDate: toDateInput(start), endDate: toDateInput(now) };
  }
  if (filter === "month") {
    return {
      startDate: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
      endDate: toDateInput(now),
    };
  }
  if (filter === "range" && startDate && endDate) return { startDate, endDate };
  return {};
};

const fmt = (v: number) =>
  `৳${(Number(v) || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const FILTERS: { value: PeriodFilter; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

// Sortable table columns; numbers start high → low, names A → Z
const COLUMNS: { key: SortKey; label: string; align?: "right" | "center" }[] = [
  { key: "name", label: "Wholesaler" },
  { key: "orders", label: "Orders", align: "right" },
  { key: "pairs", label: "Pairs", align: "right" },
  { key: "total", label: "Total Purchase", align: "right" },
  { key: "paid", label: "Paid", align: "right" },
  { key: "due", label: "Due", align: "right" },
  { key: "recent", label: "Last Order" },
  { key: "open", label: "Open Requests", align: "center" },
];

export default function WholesalerReportView() {
  const [filter, setFilter] = useState<PeriodFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("due");
  const [desc, setDesc] = useState(true);
  // Click a column: sort by it; click again: reverse
  const sortBy = (key: SortKey) => {
    if (key === sort) setDesc((d) => !d);
    else {
      setSort(key);
      setDesc(key !== "name");
    }
  };
  const [openId, setOpenId] = useState<string | null>(null);
  // In a period, list only wholesalers who bought / asked in it unless ticked
  const [showAll, setShowAll] = useState(false);
  const range = computeRange(filter, startDate, endDate);
  const periodLabel =
    filter === "all"
      ? "All time"
      : range.startDate && range.endDate
        ? range.startDate === range.endDate
          ? format(new Date(`${range.startDate}T00:00:00`), "d MMM yyyy")
          : `${format(new Date(`${range.startDate}T00:00:00`), "d MMM yyyy")} – ${format(new Date(`${range.endDate}T00:00:00`), "d MMM yyyy")}`
        : "";

  const choosePreset = (value: PeriodFilter) => {
    setFilter(value);
    setStartDate("");
    setEndDate("");
    setOpenId(null);
  };
  const applyRange = () => {
    if (!startDate || !endDate) {
      toast.error("Choose both dates");
      return;
    }
    if (startDate > endDate) {
      setStartDate(endDate);
      setEndDate(startDate);
    }
    setFilter("range");
    setOpenId(null);
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["wholesaler-report", range.startDate, range.endDate],
    queryFn: () => getWholesalerReport(range),
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings().then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = (data?.wholesalers ?? []).filter(
      (w) =>
        (filter === "all" || showAll || w.summary.orders > 0 || w.openRequests > 0) &&
        (!term ||
          [w.name, w.email, w.businessName ?? "", w.phone ?? ""].join(" ").toLowerCase().includes(term)),
    );
    // Value per column; ties fall back to the name so the order is stable
    const value = (w: IWholesalerReportRow): number | string => {
      switch (sort) {
        case "name":
          return w.name.toLowerCase();
        case "orders":
          return w.summary.orders;
        case "pairs":
          return w.summary.pairs;
        case "total":
          return w.summary.total;
        case "paid":
          return w.summary.paid;
        case "due":
          return w.summary.due;
        case "recent":
          return w.lastOrderAt ? new Date(w.lastOrderAt).getTime() : 0;
        case "open":
          return w.openRequests;
      }
    };
    return [...list].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      const cmp =
        typeof x === "string" && typeof y === "string"
          ? x.localeCompare(y)
          : (x as number) - (y as number);
      return (desc ? -cmp : cmp) || a.name.localeCompare(b.name);
    });
  }, [data, search, sort, desc, filter, showAll]);

  const print = (o: IWholesalerReportOrder) =>
    printWholesaleInvoice(
      {
        invoiceNo: o.invoiceNo,
        date: o.completedAt,
        name: o.name,
        phone: o.phone,
        email: o.email,
        businessName: o.businessName,
        location: o.location,
        lines: o.products,
        deliveryCharge: o.deliveryCharge,
        paidAmount: o.paidAmount,
        completed: true,
      },
      siteSettings,
    );

  const exportToExcel = async () => {
    // Loaded only when exporting, so the report page opens faster
    const XLSX = await import("xlsx");
    const sheet = rows.flatMap((w) =>
      w.orders.map((o) => ({
        Wholesaler: w.name,
        Email: w.email,
        Business: o.businessName || "",
        Invoice: wholesaleInvoiceNo(o.invoiceNo),
        Date: format(new Date(o.completedAt), "dd/MM/yyyy"),
        Products: o.products
          .map((p) => `${p.code}${p.color ? ` (${p.color})` : ""} x${p.quantity}`)
          .join(", "),
        Pairs: o.pairs,
        Total: o.total,
        Paid: o.paidAmount,
        Due: o.due,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(sheet), "Orders");
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        rows.map((w) => ({
          Wholesaler: w.name,
          Email: w.email,
          Business: w.businessName || "",
          Orders: w.summary.orders,
          Pairs: w.summary.pairs,
          Total: w.summary.total,
          Paid: w.summary.paid,
          Due: w.summary.due,
          LastOrder: w.lastOrderAt ? format(new Date(w.lastOrderAt), "dd/MM/yyyy") : "",
        })),
      ),
      "Summary",
    );
    XLSX.writeFile(workbook, `wholesaler-report-${filter}.xlsx`);
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[350px] rounded-xl" />
      </div>
    );
  }

  const { totals } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard
          title="Wholesalers"
          value={`${totals.active} / ${totals.wholesalers}`}
          iconName="UsersRound"
          description="Bought in this period / all accounts"
        />
        <StatsCard
          title="Total Purchase"
          value={fmt(totals.total)}
          iconName="TrendingUp"
          description={`${totals.orders} orders · ${totals.pairs.toLocaleString("en-US")} pairs`}
        />
        <StatsCard title="Paid" value={fmt(totals.paid)} iconName="Banknote" />
        <StatsCard
          title="Total Due"
          value={fmt(totals.due)}
          iconName="Wallet"
          description={`Profit (internal): ${fmt(totals.profit)}`}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            Wholesaler-wise Purchases
            {isFetching && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                type="button"
                size="sm"
                variant={filter === f.value ? "default" : "outline"}
                onClick={() => choosePreset(f.value)}
              >
                {f.label}
              </Button>
            ))}
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 w-[140px]"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 w-[140px]"
            />
            <Button
              type="button"
              size="sm"
              variant={filter === "range" ? "default" : "outline"}
              onClick={applyRange}
            >
              Apply
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={exportToExcel}
              disabled={rows.every((w) => w.orders.length === 0)}
              className="gap-2"
            >
              <Download className="size-4" /> Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
            <span>
              Showing: <b>{periodLabel}</b>
            </span>
            <span className="text-muted-foreground">
              {rows.length} of {data.wholesalers.length} wholesalers
            </span>
            {filter !== "all" && (
              <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs">
                <Checkbox checked={showAll} onCheckedChange={(v) => setShowAll(v === true)} />
                Also show wholesalers with no orders in this period
              </label>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search wholesaler, email, shop or phone"
                className="pl-9"
              />
            </div>
            <p className="self-center text-xs text-muted-foreground">
              Click a column title to sort; click again to reverse.
            </p>
          </div>

          {data.wholesalers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center">
              <UsersRound className="size-10 text-muted-foreground/40" />
              <p className="font-semibold">No wholesaler accounts yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Make a user a wholesaler from{" "}
                <Link href="/admin/dashboard/users?role=USER" className="font-medium text-primary underline">
                  Users
                </Link>{" "}
                (⋯ → Make Wholesaler), then link their wholesale requests to the account.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="w-10 px-3 py-2.5" />
                    {COLUMNS.map((c) => {
                      const active = sort === c.key;
                      return (
                        <th
                          key={c.key}
                          aria-sort={active ? (desc ? "descending" : "ascending") : "none"}
                          className={cn(
                            "px-3 py-2.5 font-semibold",
                            c.align === "right" && "text-right",
                            c.align === "center" && "text-center",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => sortBy(c.key)}
                            className={cn(
                              "inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground",
                              active && "text-primary",
                            )}
                          >
                            {c.label}
                            {active ? (
                              desc ? <ArrowDown className="size-3.5" /> : <ArrowUp className="size-3.5" />
                            ) : (
                              <ArrowUpDown className="size-3.5 opacity-40" />
                            )}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-10 text-center text-muted-foreground">
                        {search.trim()
                          ? "No wholesaler matches your search."
                          : "No wholesaler bought anything in this period."}
                      </td>
                    </tr>
                  )}
                  {rows.map((w) => {
                    const open = openId === w.id;
                    return (
                      <Fragment key={w.id}>
                        <tr
                          onClick={() => setOpenId(open ? null : w.id)}
                          className={cn(
                            "cursor-pointer border-b hover:bg-muted/30",
                            open && "bg-muted/40",
                          )}
                        >
                          <td className="px-3 py-2.5">
                            <ChevronDown
                              className={cn(
                                "size-4 text-muted-foreground transition-transform",
                                open && "rotate-180",
                              )}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="font-semibold">
                              {w.name}
                              {w.status === "BLOCKED" && (
                                <span className="ml-2 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-600">
                                  Blocked
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {[w.businessName, w.email, w.phone].filter(Boolean).join(" · ")}
                            </p>
                          </td>
                          <td className="px-3 py-2.5 text-right">{w.summary.orders}</td>
                          <td className="px-3 py-2.5 text-right">{w.summary.pairs}</td>
                          <td className="px-3 py-2.5 text-right font-semibold">{fmt(w.summary.total)}</td>
                          <td className="px-3 py-2.5 text-right">{fmt(w.summary.paid)}</td>
                          <td
                            className={cn(
                              "px-3 py-2.5 text-right font-semibold",
                              w.summary.due > 0 ? "text-red-600" : "text-emerald-600",
                            )}
                          >
                            {fmt(w.summary.due)}
                          </td>
                          <td className="px-3 py-2.5 text-xs">
                            {w.lastOrderAt ? format(new Date(w.lastOrderAt), "d MMM yyyy") : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {w.openRequests > 0 ? (
                              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                                {w.openRequests}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>

                        {open && (
                          <tr className="border-b bg-muted/20">
                            <td colSpan={9} className="px-4 py-4">
                              {w.orders.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                  No completed orders in this period.
                                  {w.openRequests > 0 && (
                                    <>
                                      {" "}
                                      {w.openRequests} open request(s) in{" "}
                                      <Link href="/admin/dashboard/wholesale-requests" className="font-medium text-primary underline">
                                        Wholesale Requests
                                      </Link>
                                      .
                                    </>
                                  )}
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {w.orders.map((o) => (
                                    <div key={o.id} className="rounded-xl border bg-card p-3">
                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                        <span className="font-mono text-xs font-bold">
                                          {wholesaleInvoiceNo(o.invoiceNo)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {format(new Date(o.completedAt), "d MMM yyyy")}
                                        </span>
                                        <span className="text-xs">
                                          {o.pairs} pairs · Total <b>{fmt(o.total)}</b> · Paid {fmt(o.paidAmount)} ·{" "}
                                          <b className={o.due > 0 ? "text-red-600" : "text-emerald-600"}>
                                            Due {fmt(o.due)}
                                          </b>
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="ml-auto h-7 gap-1.5 text-xs"
                                          onClick={() => print(o)}
                                        >
                                          <Printer className="size-3.5" /> Invoice
                                        </Button>
                                      </div>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {o.products.map((p, i) => (
                                          <div
                                            key={`${p.productId}-${p.color}-${i}`}
                                            className="flex items-center gap-2 rounded-lg border bg-background py-1 pl-1 pr-2.5 text-xs"
                                          >
                                            <div className="size-8 shrink-0 overflow-hidden rounded bg-muted">
                                              {p.image && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={p.image} alt="" className="h-full w-full object-cover" />
                                              )}
                                            </div>
                                            <div>
                                              <p className="max-w-[160px] truncate font-medium" title={p.name}>
                                                {p.name}
                                              </p>
                                              <p className="text-muted-foreground">
                                                {p.code}
                                                {p.color && ` · ${p.color}`} · {p.quantity} × {fmt(p.unitPrice)}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
