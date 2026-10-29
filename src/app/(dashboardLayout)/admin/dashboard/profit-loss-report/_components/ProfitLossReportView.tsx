"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ResponsiveChartContainer from "@/components/shared/ResponsiveChartContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatsCard from "@/components/shared/StatsCard";
import DataTable from "@/components/shared/table/DataTable";
import { Download } from "lucide-react";
import { getProfitLossItems, getProfitLossSummary } from "@/services/profitLoss.services";
import { IProfitLossItem, IProfitLossTotals, IPeriodSummary } from "@/types/profitLoss.types";
import { profitLossColumns } from "./profitLossColumns";

type PeriodFilter = "all" | "today" | "week" | "month" | "range";

const SALES_COLOR = "#2a78d6";
const COST_COLOR = "#eb6834";
const EXPENSE_COLOR = "#1baf7a";

const emptyPeriod: IPeriodSummary = {
  today: 0,
  yesterday: 0,
  thisWeek: 0,
  lastWeek: 0,
  thisMonth: 0,
  lastMonth: 0,
  allTime: 0,
};

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

const computeRange = (
  filter: PeriodFilter,
  startDate: string,
  endDate: string,
): Record<string, string> => {
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
    return current > 0 ? "New profit vs last period" : "No change vs last period";
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}% vs last period`;
};

const fmt = (v: number) => `৳${Number(v || 0).toFixed(2)}`;

export default function ProfitLossReportView() {
  const [filter, setFilter] = useState<PeriodFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: summaryRes, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["profit-loss-summary"],
    queryFn: () => getProfitLossSummary(),
  });

  const summary = summaryRes?.data;
  const sales = summary?.sales ?? emptyPeriod;
  const cost = summary?.cost ?? emptyPeriod;
  const discountSummary = summary?.discount ?? emptyPeriod;
  const shippingSummary = summary?.shipping ?? emptyPeriod;
  const profit = summary?.profit ?? emptyPeriod;
  const expense = summary?.expense ?? emptyPeriod;
  const netProfit = summary?.netProfit ?? emptyPeriod;

  const range = computeRange(filter, startDate, endDate);

  const { data: itemsRes, isLoading: isItemsLoading } = useQuery({
    queryKey: ["profit-loss-items", range.startDate, range.endDate],
    queryFn: () => getProfitLossItems(range),
  });

  const items: IProfitLossItem[] = itemsRes?.data?.items ?? [];
  const totals: IProfitLossTotals = itemsRes?.data?.totals ?? {
    totalSales: 0,
    totalCost: 0,
    totalDiscount: 0,
    totalShipping: 0,
    totalProfit: 0,
  };

  const comparisonData = [
    { name: "Today", Sales: sales.today, Cost: cost.today, Expense: expense.today },
    {
      name: "This Week",
      Sales: sales.thisWeek,
      Cost: cost.thisWeek,
      Expense: expense.thisWeek,
    },
    {
      name: "This Month",
      Sales: sales.thisMonth,
      Cost: cost.thisMonth,
      Expense: expense.thisMonth,
    },
  ];

  const handleApplyRange = () => {
    if (startDate && endDate) setFilter("range");
  };

  const exportToExcel = () => {
    const rows = items.map((item) => ({
      Product: item.product?.name,
      Variant: item.productVariant?.combination || "-",
      PurchasePrice: item.unitCost,
      SalePrice: item.price,
      Quantity: item.quantity,
      TotalSale: item.lineTotal,
      TotalCost: item.lineCost,
      Discount: Number(item.lineDiscount.toFixed(2)),
      ProfitOrLoss: Number(item.lineProfit.toFixed(2)),
      OrderNo: item.order?.orderNumber,
      OrderType: item.order?.orderType,
      Date: item.order?.createdAt
        ? new Date(item.order.createdAt).toLocaleDateString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Profit & Loss");
    XLSX.writeFile(workbook, `profit-loss-report-${filter}.xlsx`);
  };

  if (isSummaryLoading) {
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

  return (
    <div className="space-y-6">
      {/* All-time headline */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard title="Total Sales" value={fmt(sales.allTime)} iconName="TrendingUp" />
        <StatsCard title="Total Cost (COGS)" value={fmt(cost.allTime)} iconName="Package" />
        <StatsCard
          title="Gross Profit"
          value={fmt(profit.allTime)}
          iconName="Banknote"
          description="After cost & discount, before expense"
        />
        <StatsCard
          title="Net Profit"
          value={fmt(netProfit.allTime)}
          iconName="Wallet"
          description={`After ${fmt(expense.allTime)} total expense`}
        />
      </div>

      {/* Discount & Shipping breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="Total Discount Given"
          value={fmt(discountSummary.allTime)}
          iconName="Ticket"
          description="Deducted from gross profit above"
        />
        <StatsCard
          title="Total Shipping Collected"
          value={fmt(shippingSummary.allTime)}
          iconName="Truck"
          description="Informational — not counted in profit"
        />
      </div>

      {/* Period net profit */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard
          title="Net Profit — Today"
          value={fmt(netProfit.today)}
          iconName="Sun"
          description={pctChange(netProfit.today, netProfit.yesterday)}
        />
        <StatsCard
          title="Net Profit — This Week"
          value={fmt(netProfit.thisWeek)}
          iconName="CalendarDays"
          description={pctChange(netProfit.thisWeek, netProfit.lastWeek)}
        />
        <StatsCard
          title="Net Profit — This Month"
          value={fmt(netProfit.thisMonth)}
          iconName="CalendarRange"
          description={pctChange(netProfit.thisMonth, netProfit.lastMonth)}
        />
        <StatsCard
          title="Net Profit — All Time"
          value={fmt(netProfit.allTime)}
          iconName="PiggyBank"
          description="Lifetime net profit"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Sales, Cost & Expense by Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveChartContainer>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e0d9" />
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
                <Bar dataKey="Sales" fill={SALES_COLOR} radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="Cost" fill={COST_COLOR} radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="Expense" fill={EXPENSE_COLOR} radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters + Product Profit/Loss Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base font-bold">
            Product-wise Profit / Loss
          </CardTitle>

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
            columns={profitLossColumns}
            isLoading={isItemsLoading}
            emptyMessage="No delivered orders found for this period."
            toolbarAction={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={exportToExcel}
                disabled={items.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            }
          />

          {/* Grand Total */}
          <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4 text-sm font-semibold sm:grid-cols-5">
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Total Sale</span>
              <span className="text-lg font-bold sm:mt-1 sm:block">
                {fmt(totals.totalSales)}
              </span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Total Cost</span>
              <span className="text-lg font-bold sm:mt-1 sm:block">
                {fmt(totals.totalCost)}
              </span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Total Discount</span>
              <span className="text-lg font-bold sm:mt-1 sm:block">
                {fmt(totals.totalDiscount)}
              </span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Total Shipping</span>
              <span className="text-lg font-bold sm:mt-1 sm:block">
                {fmt(totals.totalShipping)}
              </span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Total Profit / Loss</span>
              <span
                className={`text-lg font-bold sm:mt-1 sm:block ${
                  totals.totalProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {fmt(totals.totalProfit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
