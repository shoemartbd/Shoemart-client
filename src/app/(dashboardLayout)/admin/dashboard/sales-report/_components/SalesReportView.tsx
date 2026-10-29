"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import ResponsiveChartContainer from "@/components/shared/ResponsiveChartContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from "@/components/shared/StatsCard";
import DataTable from "@/components/shared/table/DataTable";
import { Download } from "lucide-react";
import {
  getSalesReportItems,
  getSalesSummary,
} from "@/services/salesReport.services";
import {
  ISalesReportItem,
  ISalesReportProductSummary,
  ISalesReportTotals,
  ISalesSummary,
  PeriodFilter,
} from "./types";
import {
  productSummaryColumns,
  salesReportColumns,
} from "./salesReportColumns";

const CURRENT_COLOR = "#2a78d6";
const PREVIOUS_COLOR = "#eb6834";

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

const computeRange = (
  filter: PeriodFilter,
  startDate: string,
  endDate: string,
) => {
  const now = new Date();

  if (filter === "today") {
    const d = toDateInput(now);
    return { startDate: d, endDate: d };
  }
  if (filter === "week") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { startDate: toDateInput(start), endDate: toDateInput(now) };
  }
  if (filter === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: toDateInput(start), endDate: toDateInput(now) };
  }
  if (filter === "range" && startDate && endDate) {
    return { startDate, endDate };
  }
  return {};
};

const pctChange = (current: number, previous: number) => {
  if (previous <= 0) {
    return current > 0 ? "New sales vs last period" : "No change vs last period";
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}% vs last period`;
};

const fmt = (v: number) => `৳${Number(v || 0).toFixed(2)}`;

export default function SalesReportView() {
  const [filter, setFilter] = useState<PeriodFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: summaryRes, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["sales-report-summary"],
    queryFn: () => getSalesSummary(),
  });

  const summary: ISalesSummary = summaryRes?.data || {
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
    allTime: 0,
  };

  const range = computeRange(filter, startDate, endDate);

  const { data: itemsRes, isLoading: isItemsLoading } = useQuery({
    queryKey: ["sales-report-items", range.startDate, range.endDate],
    queryFn: () => getSalesReportItems(range),
  });

  const items: ISalesReportItem[] = itemsRes?.data?.items || [];
  const productSummary: ISalesReportProductSummary[] =
    itemsRes?.data?.productSummary || [];
  const totals: ISalesReportTotals = itemsRes?.data?.totals || {
    totalSales: 0,
    totalQuantity: 0,
  };

  const comparisonData = [
    { name: "Today", Current: summary.today, Previous: summary.yesterday },
    { name: "This Week", Current: summary.thisWeek, Previous: summary.lastWeek },
    { name: "This Month", Current: summary.thisMonth, Previous: summary.lastMonth },
  ];

  const trendData = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of (itemsRes?.data?.items || []) as ISalesReportItem[]) {
      const date = new Date(item.order.createdAt).toISOString().slice(0, 10);
      map.set(date, (map.get(date) || 0) + item.lineTotal);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total }));
  }, [itemsRes]);

  const handleApplyRange = () => {
    if (startDate && endDate) setFilter("range");
  };

  const exportItemsToExcel = () => {
    const rows = items.map((item) => ({
      ProductName: item.product?.name,
      Variant: item.productVariant?.combination || "-",
      Price: item.price,
      Quantity: item.quantity,
      Returned: item.returnedQuantity,
      Total: item.lineTotal,
      OrderNo: item.order?.orderNumber,
      OrderType: item.order?.orderType,
      Date: item.order?.createdAt
        ? new Date(item.order.createdAt).toLocaleDateString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, `sales-report-${filter}.xlsx`);
  };

  const exportSummaryToExcel = () => {
    const rows = productSummary.map((p) => ({
      ProductName: p.name,
      TotalSold: p.quantity,
      TotalSales: p.total,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Summary");
    XLSX.writeFile(workbook, `product-summary-${filter}.xlsx`);
  };

  if (isSummaryLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[350px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Today"
          value={fmt(summary.today)}
          iconName="Sun"
          description={pctChange(summary.today, summary.yesterday)}
        />
        <StatsCard
          title="This Week"
          value={fmt(summary.thisWeek)}
          iconName="CalendarDays"
          description={pctChange(summary.thisWeek, summary.lastWeek)}
        />
        <StatsCard
          title="This Month"
          value={fmt(summary.thisMonth)}
          iconName="CalendarRange"
          description={pctChange(summary.thisMonth, summary.lastMonth)}
        />
        <StatsCard
          title="All Time"
          value={fmt(summary.allTime)}
          iconName="Wallet"
          description="Lifetime delivered sales"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Sales: Current vs Previous Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
            <ResponsiveChartContainer>
                <BarChart data={comparisonData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e1e0d9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#898781", fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#898781", fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                    }}
                    formatter={(value) => fmt(Number(value))}
                  />
                  <Legend iconType="circle" />
                  <Bar
                    dataKey="Current"
                    fill={CURRENT_COLOR}
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                  <Bar
                    dataKey="Previous"
                    fill={PREVIOUS_COLOR}
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Daily Sales Trend (Selected Range)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveChartContainer>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="salesTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CURRENT_COLOR} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CURRENT_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e1e0d9"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#898781", fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#898781", fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                    }}
                    formatter={(value) => fmt(Number(value))}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={CURRENT_COLOR}
                    strokeWidth={2}
                    fill="url(#salesTrendFill)"
                  />
                </AreaChart>
              </ResponsiveChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Items Table */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-base font-bold">Delivered Sales</CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            {(["all", "today", "week", "month"] as PeriodFilter[]).map((f) => (
              <Button
                key={f}
                type="button"
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
              >
                {f === "all"
                  ? "All"
                  : f === "today"
                    ? "Today"
                    : f === "week"
                      ? "This Week"
                      : "This Month"}
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
            <Button type="button" size="sm" onClick={handleApplyRange}>
              Apply
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <DataTable
            data={items}
            columns={salesReportColumns}
            isLoading={isItemsLoading}
            emptyMessage="No delivered orders found for this period."
            toolbarAction={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={exportItemsToExcel}
                disabled={items.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            }
          />

          {/* Grand Total */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4 text-sm font-semibold">
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Total Quantity</span>
              <span className="sm:block sm:mt-1 text-lg font-bold">
                {totals.totalQuantity}
              </span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Total Sales</span>
              <span className="sm:block sm:mt-1 text-lg font-bold text-primary">
                {fmt(totals.totalSales)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">
            Total Product Sold Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={productSummary}
            columns={productSummaryColumns}
            isLoading={isItemsLoading}
            emptyMessage="No products sold in this period."
            toolbarAction={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={exportSummaryToExcel}
                disabled={productSummary.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export Summary
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
