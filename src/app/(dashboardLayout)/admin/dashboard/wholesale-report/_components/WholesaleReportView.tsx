"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatsCard from "@/components/shared/StatsCard";
import { getWholesaleReport } from "@/services/wholesaleRequest.services";
import { wholesaleInvoiceNo } from "@/lib/printWholesaleInvoice";
import { cn } from "@/lib/utils";

type PeriodFilter = "all" | "today" | "week" | "month" | "range";

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

const pctChange = (current: number, previous: number) => {
  if (previous <= 0) return current > 0 ? "New vs last period" : "No change vs last period";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs last period`;
};

const fmt = (v: number) =>
  `৳${(Number(v) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const FILTERS: { value: PeriodFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

export default function WholesaleReportView() {
  const [filter, setFilter] = useState<PeriodFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const range = computeRange(filter, startDate, endDate);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["wholesale-report", range.startDate, range.endDate],
    queryFn: () => getWholesaleReport(range),
  });

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

  const { summary, items, totals } = data;

  const exportToExcel = () => {
    const rows = items.map((r) => ({
      Invoice: wholesaleInvoiceNo(r.invoiceNo),
      Date: format(new Date(r.completedAt), "dd/MM/yyyy"),
      Buyer: r.name,
      Business: r.businessName || "",
      Phone: r.phone,
      Pairs: r.pairs,
      Subtotal: r.subtotal,
      Delivery: r.deliveryCharge,
      GrandTotal: r.total,
      Cost: r.cost,
      ProfitOrLoss: r.profit,
      Paid: r.paidAmount,
      Due: r.due,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Wholesale");
    XLSX.writeFile(workbook, `wholesale-report-${filter}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* All-time headline */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard
          title="Wholesale Sales"
          value={fmt(summary.sales.allTime)}
          iconName="TrendingUp"
          description="Without delivery charge"
        />
        <StatsCard title="Total Cost" value={fmt(summary.cost.allTime)} iconName="Package" />
        <StatsCard
          title="Profit / Loss"
          value={fmt(summary.profit.allTime)}
          iconName="Banknote"
          description="Sales − cost"
        />
        <StatsCard
          title="Pairs Sold"
          value={summary.pairs.allTime.toLocaleString("en-US")}
          iconName="Footprints"
          description={`Due to collect ${fmt(summary.due.allTime)}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatsCard
          title="Profit — Today"
          value={fmt(summary.profit.today)}
          iconName="Sun"
          description={pctChange(summary.profit.today, summary.profit.yesterday)}
        />
        <StatsCard
          title="Profit — This Week"
          value={fmt(summary.profit.thisWeek)}
          iconName="CalendarDays"
          description={pctChange(summary.profit.thisWeek, summary.profit.lastWeek)}
        />
        <StatsCard
          title="Profit — This Month"
          value={fmt(summary.profit.thisMonth)}
          iconName="CalendarRange"
          description={pctChange(summary.profit.thisMonth, summary.profit.lastMonth)}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            Sale-wise Profit / Loss
            {isFetching && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                type="button"
                size="sm"
                variant={filter === f.value ? "default" : "outline"}
                onClick={() => setFilter(f.value)}
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
              onClick={() => startDate && endDate && setFilter("range")}
            >
              Apply
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={exportToExcel}
              disabled={items.length === 0}
              className="gap-2"
            >
              <Download className="size-4" /> Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2.5 font-semibold">Invoice</th>
                  <th className="px-3 py-2.5 font-semibold">Date</th>
                  <th className="px-3 py-2.5 font-semibold">Buyer</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Pairs</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Subtotal</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Delivery</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Cost</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Profit / Loss</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Due</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-10 text-center text-muted-foreground">
                      No completed wholesale sales in this period. Mark a request as{" "}
                      <Link href="/admin/dashboard/wholesale-requests" className="font-medium text-primary underline">
                        Sale Complete
                      </Link>{" "}
                      to see it here.
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2.5 font-mono text-xs font-semibold">
                        {wholesaleInvoiceNo(r.invoiceNo)}
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        {format(new Date(r.completedAt), "d MMM yyyy")}
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-medium">{r.businessName || r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.phone}</p>
                      </td>
                      <td className="px-3 py-2.5 text-right">{r.pairs}</td>
                      <td className="px-3 py-2.5 text-right">{fmt(r.subtotal)}</td>
                      <td className="px-3 py-2.5 text-right">{fmt(r.deliveryCharge)}</td>
                      <td className="px-3 py-2.5 text-right">{fmt(r.cost)}</td>
                      <td
                        className={cn(
                          "px-3 py-2.5 text-right font-semibold",
                          r.profit >= 0 ? "text-green-600" : "text-red-600",
                        )}
                      >
                        {fmt(r.profit)}
                      </td>
                      <td className={cn("px-3 py-2.5 text-right", r.due > 0 && "text-red-600")}>
                        {fmt(r.due)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals for the selected period */}
          <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4 text-sm font-semibold sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Sales", String(totals.sales)],
              ["Pairs", totals.pairs.toLocaleString("en-US")],
              ["Sale", fmt(totals.subtotal)],
              ["Total Cost", fmt(totals.cost)],
              ["Due", fmt(totals.due)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between sm:block">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-lg font-bold sm:mt-1 sm:block">{value}</span>
              </div>
            ))}
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Profit / Loss</span>
              <span
                className={cn(
                  "text-lg font-bold sm:mt-1 sm:block",
                  totals.profit >= 0 ? "text-green-600" : "text-red-600",
                )}
              >
                {fmt(totals.profit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
