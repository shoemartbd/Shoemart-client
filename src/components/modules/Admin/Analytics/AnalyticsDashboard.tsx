"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ResponsiveChartContainer from "@/components/shared/ResponsiveChartContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatsCard from "@/components/shared/StatsCard";
import DataTable from "@/components/shared/table/DataTable";
import { Download } from "lucide-react";
import { getAdminAnalytics } from "@/services/analytics.services";
import {
  getPlatformItems,
  getPlatformOverview,
  getPlatformSummary,
} from "@/services/platformReport.services";
import {
  IPeriodSummary,
  IPlatformReportItem,
  IPlatformReportTotals,
} from "@/types/platformReport.types";
import { analyticsItemColumns } from "./analyticsItemColumns";
import AIAnalyticsInsights from "./AIAnalyticsInsights";

type PeriodFilter = "all" | "today" | "week" | "month" | "range";

const CATEGORY_COLORS = [
  "#2a78d6",
  "#8b5cf6",
  "#1baf7a",
  "#eb6834",
  "#ef4444",
  "#06b6d4",
];

const CHANNEL_COLORS: Record<string, string> = {
  ONLINE: "#2a78d6",
  POS: "#eb6834",
  LANDING_PAGE: "#1baf7a",
};

const STATUS_BADGE_VARIANT: Record<
  string,
  "secondary" | "outline" | "default" | "destructive"
> = {
  PENDING: "secondary",
  CONFIRMED: "outline",
  IN_COURIER: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

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

const fmt = (v: number) => `৳${Number(v || 0).toFixed(2)}`;

export default function AnalyticsDashboard() {
  const [filter, setFilter] = useState<PeriodFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: adminAnalytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => getAdminAnalytics(),
  });

  const { data: summaryRes, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["platform-summary"],
    queryFn: () => getPlatformSummary(),
  });

  const summary = summaryRes?.data;
  const gmv = summary?.gmv ?? emptyPeriod;

  const range = computeRange(filter, startDate, endDate);

  const { data: overviewRes, isLoading: isOverviewLoading } = useQuery({
    queryKey: ["platform-overview", range.startDate, range.endDate],
    queryFn: () => getPlatformOverview(range),
  });

  const overview = overviewRes?.data;

  const { data: itemsRes, isLoading: isItemsLoading } = useQuery({
    queryKey: ["platform-items", range.startDate, range.endDate],
    queryFn: () => getPlatformItems(range),
  });

  const items: IPlatformReportItem[] = itemsRes?.data?.items ?? [];
  const totals: IPlatformReportTotals = itemsRes?.data?.totals ?? {
    totalGmv: 0,
    totalQuantity: 0,
  };

  const categoryData =
    adminAnalytics?.categoryDistribution
      ?.filter((cat: { _count: { products: number } }) => cat._count.products > 0)
      .map((cat: { name: string; _count: { products: number } }) => ({
        name: cat.name,
        value: cat._count.products,
      })) ?? [];

  const revenueByPeriod = [
    { name: "Today", Revenue: gmv.today },
    { name: "This Week", Revenue: gmv.thisWeek },
    { name: "This Month", Revenue: gmv.thisMonth },
  ];

  const channelData =
    overview?.byOrderType.map((c) => ({
      name: c.orderType === "LANDING_PAGE" ? "Landing Page" : c.orderType,
      Revenue: c.gmv,
      fill: CHANNEL_COLORS[c.orderType] || CATEGORY_COLORS[0],
    })) ?? [];

  const handleApplyRange = () => {
    if (startDate && endDate) setFilter("range");
  };

  const exportToExcel = () => {
    const rows = items.map((item) => ({
      Product: item.product?.name,
      Variant: item.productVariant?.combination || "-",
      Price: item.price,
      Quantity: item.quantity,
      Returned: item.returnedQuantity,
      TotalRevenue: item.lineTotal,
      OrderNo: item.order?.orderNumber,
      OrderType: item.order?.orderType,
      Date: item.order?.createdAt
        ? new Date(item.order.createdAt).toLocaleDateString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics");
    XLSX.writeFile(workbook, `analytics-${filter}.xlsx`);
  };

  const isLoadingHeadline = isAnalyticsLoading || isSummaryLoading;

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">
            Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Real-time view of your marketplace performance
          </p>
        </div>
        <AIAnalyticsInsights />
      </div>

      {/* Headline KPIs */}
      {isLoadingHeadline ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={adminAnalytics?.summary?.totalUsers ?? 0}
            iconName="Users"
          />
          <StatsCard
            title="Total Products"
            value={adminAnalytics?.summary?.totalProducts ?? 0}
            iconName="Package"
          />
          <StatsCard
            title="Total Orders"
            value={adminAnalytics?.summary?.totalOrders ?? 0}
            iconName="ShoppingCart"
          />
          <StatsCard
            title="Total Revenue (All Time)"
            value={fmt(gmv.allTime)}
            iconName="TrendingUp"
            description="Delivered orders, net of returns"
          />
        </div>
      )}

      {/* Revenue by Period */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Revenue by Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveChartContainer>
              <BarChart data={revenueByPeriod}>
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
                <Bar dataKey="Revenue" fill={CATEGORY_COLORS[0]} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category distribution + channel mix */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyticsLoading ? (
              <Skeleton className="h-[280px] rounded-xl" />
            ) : categoryData.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                No products yet.
              </div>
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveChartContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={800}
                    >
                      {categoryData.map((_entry: { name: string; value: number }, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "12px",
                        border: "none",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                  </PieChart>
                </ResponsiveChartContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Orders by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            {isOverviewLoading ? (
              <Skeleton className="h-[280px] rounded-xl" />
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveChartContainer>
                  <BarChart data={channelData} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e1e0d9" />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#898781", fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      width={100}
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
                    <Bar dataKey="Revenue" radius={[0, 6, 6, 0]} barSize={28}>
                      {channelData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveChartContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order status + top products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {isOverviewLoading ? (
              <Skeleton className="h-[220px] rounded-xl" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {overview?.byOrderStatus.map((s) => (
                  <div
                    key={s.orderStatus}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <Badge
                      variant={STATUS_BADGE_VARIANT[s.orderStatus] ?? "secondary"}
                      className="font-semibold"
                    >
                      {s.orderStatus.replace("_", " ")}
                    </Badge>
                    <span className="text-xl font-bold">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview?.topProducts.length ? (
                  overview.topProducts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-semibold">{product.name}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{fmt(product.revenue)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                      No data for this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Detailed Table */}
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base font-bold">Detailed Order Items</CardTitle>

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
            columns={analyticsItemColumns}
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
          <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border bg-muted/30 p-4 text-sm font-semibold">
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="text-lg font-bold sm:mt-1 sm:block">{fmt(totals.totalGmv)}</span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-muted-foreground">Total Quantity</span>
              <span className="text-lg font-bold sm:mt-1 sm:block">{totals.totalQuantity}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
