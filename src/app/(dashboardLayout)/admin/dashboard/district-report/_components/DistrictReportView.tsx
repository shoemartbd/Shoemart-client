"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import ResponsiveChartContainer from "@/components/shared/ResponsiveChartContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from "@/components/shared/StatsCard";
import DataTable from "@/components/shared/table/DataTable";
import { Download } from "lucide-react";
import { getDistrictReportOverview } from "@/services/districtReport.services";
import {
  IDistrictReportDistrict,
  IDistrictReportOrder,
  IDistrictReportSummary,
} from "@/types/districtReport.types";
import { districtColumns, orderColumns } from "./districtReportColumns";

type PeriodFilter = "all" | "today" | "week" | "month" | "range";

const BAR_COLOR = "#2a78d6";

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

const fmt = (v: number) => `৳${Number(v || 0).toFixed(2)}`;

const emptySummary: IDistrictReportSummary = {
  totalOrders: 0,
  totalRevenue: 0,
  totalQuantity: 0,
  totalDistricts: 0,
};

export default function DistrictReportView() {
  const [filter, setFilter] = useState<PeriodFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const range = computeRange(filter, startDate, endDate);

  const { data: overviewRes, isLoading } = useQuery({
    queryKey: ["district-report-overview", range.startDate, range.endDate],
    queryFn: () => getDistrictReportOverview(range),
  });

  const summary: IDistrictReportSummary =
    overviewRes?.data?.summary || emptySummary;
  const districts: IDistrictReportDistrict[] = overviewRes?.data?.districts || [];
  const orders: IDistrictReportOrder[] = overviewRes?.data?.orders || [];

  const topDistrict = districts[0]?.district || "—";

  const chartData = districts.slice(0, 10).map((d) => ({
    name: d.district,
    Revenue: d.totalRevenue,
  }));

  const handleApplyRange = () => {
    if (startDate && endDate) setFilter("range");
  };

  const exportDistrictsToExcel = () => {
    const rows = districts.map((d) => ({
      District: d.district,
      Orders: d.totalOrders,
      Revenue: d.totalRevenue,
      Quantity: d.totalQuantity,
      TopProduct: d.topProducts?.[0]?.name || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "District Breakdown");
    XLSX.writeFile(workbook, `district-report-${filter}.xlsx`);
  };

  const exportOrdersToExcel = () => {
    const rows = orders.map((o) => ({
      OrderNo: o.orderNumber || "-",
      Customer: o.fullName || "-",
      Phone: o.phone || "-",
      District: o.district,
      Channel: o.orderType,
      Amount: o.totalAmount,
      Date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "",
      Items: o.items.map((i) => `${i.productName} x${i.quantity}`).join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Detailed Orders");
    XLSX.writeFile(workbook, `district-orders-${filter}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[350px] rounded-xl" />
        <Skeleton className="h-[350px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Orders"
          value={summary.totalOrders}
          iconName="ShoppingCart"
          description="Orders in selected period"
        />
        <StatsCard
          title="Total Revenue"
          value={fmt(summary.totalRevenue)}
          iconName="Wallet"
          description="Revenue in selected period"
        />
        <StatsCard
          title="Districts Covered"
          value={summary.totalDistricts}
          iconName="MapPin"
          description="Unique districts with orders"
        />
        <StatsCard
          title="Top District"
          value={topDistrict}
          iconName="Trophy"
          description="Highest revenue district"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Top Districts by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveChartContainer>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e1e0d9"
                />
                <XAxis
                  dataKey="name"
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
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                  }}
                  formatter={(value) => fmt(Number(value))}
                />
                <Bar
                  dataKey="Revenue"
                  fill={BAR_COLOR}
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters + District Breakdown */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-base font-bold">
            District Breakdown
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
            data={districts}
            columns={districtColumns}
            isLoading={isLoading}
            emptyMessage="No district data found for this period."
            toolbarAction={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={exportDistrictsToExcel}
                disabled={districts.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Detailed Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">
            Detailed Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={orders}
            columns={orderColumns}
            isLoading={isLoading}
            emptyMessage="No orders found for this period."
            toolbarAction={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={exportOrdersToExcel}
                disabled={orders.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
