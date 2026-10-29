"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ResponsiveChartContainer from "@/components/shared/ResponsiveChartContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from "@/components/shared/StatsCard";
import DataTable from "@/components/shared/table/DataTable";
import { Download } from "lucide-react";
import { getCustomerSegmentReportOverview } from "@/services/customerSegmentReport.services";
import {
  ICustomerSegment,
  ICustomerSegmentBreakdown,
  ICustomerSegmentSummary,
} from "@/types/customerSegmentReport.types";
import { customerSegmentColumns } from "./customerSegmentColumns";

type PeriodFilter = "all" | "today" | "week" | "month" | "range";

const SEGMENT_COLORS: Record<string, string> = {
  NEW: "#2a78d6",
  REGULAR: "#eb6834",
  LOYAL: "#1baf7a",
};

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

const emptySummary: ICustomerSegmentSummary = {
  totalCustomers: 0,
  newCustomers: 0,
  regularCustomers: 0,
  loyalCustomers: 0,
  highSpenderCount: 0,
  totalRevenue: 0,
  unidentifiedOrders: 0,
};

export default function CustomerSegmentReportView() {
  const [filter, setFilter] = useState<PeriodFilter>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const range = computeRange(filter, startDate, endDate);

  const { data: overviewRes, isLoading } = useQuery({
    queryKey: ["customer-segment-report-overview", range.startDate, range.endDate],
    queryFn: () => getCustomerSegmentReportOverview(range),
  });

  const summary: ICustomerSegmentSummary =
    overviewRes?.data?.summary || emptySummary;
  const segmentBreakdown: ICustomerSegmentBreakdown[] =
    overviewRes?.data?.segmentBreakdown || [];
  const highSpenderThreshold: number =
    overviewRes?.data?.highSpenderThreshold || 0;
  const customers: ICustomerSegment[] = overviewRes?.data?.customers || [];

  const chartData = segmentBreakdown.map((s) => ({
    name: s.segment,
    Customers: s.count,
    fill: SEGMENT_COLORS[s.segment],
  }));

  const handleApplyRange = () => {
    if (startDate && endDate) setFilter("range");
  };

  const exportCustomersToExcel = () => {
    const rows = customers.map((c) => ({
      Phone: c.phone,
      Customer: c.fullName || "-",
      District: c.district || "-",
      Segment: c.segment,
      TotalOrders: c.totalOrders,
      TotalRevenue: c.totalRevenue,
      TotalQuantity: c.totalQuantity,
      IsHighSpender: c.isHighSpender ? "Yes" : "No",
      FirstOrderDate: c.firstOrderDate
        ? new Date(c.firstOrderDate).toLocaleDateString()
        : "",
      LastOrderDate: c.lastOrderDate
        ? new Date(c.lastOrderDate).toLocaleDateString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Segments");
    XLSX.writeFile(workbook, `customer-segment-report-${filter}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Customers"
          value={summary.totalCustomers}
          iconName="Users"
          description="Customers in selected period"
        />
        <StatsCard
          title="New Customers"
          value={summary.newCustomers}
          iconName="UserPlus"
          description="Exactly 1 delivered order"
        />
        <StatsCard
          title="Regular Customers"
          value={summary.regularCustomers}
          iconName="Repeat"
          description="2 to 4 delivered orders"
        />
        <StatsCard
          title="Loyal Customers"
          value={summary.loyalCustomers}
          iconName="Crown"
          description="5 or more delivered orders"
        />
        <StatsCard
          title="High Spenders"
          value={summary.highSpenderCount}
          iconName="Gem"
          description={`Spent ${fmt(highSpenderThreshold)}+`}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {summary.unidentifiedOrders} order(s) in this period had no
        identifiable phone number and could not be attributed to a customer.
      </p>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Customers by Segment
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
                />
                <Bar dataKey="Customers" radius={[6, 6, 0, 0]} barSize={48}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters + Customers */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-base font-bold">Customers</CardTitle>

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
            data={customers}
            columns={customerSegmentColumns}
            isLoading={isLoading}
            emptyMessage="No customer data found for this period."
            toolbarAction={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={exportCustomersToExcel}
                disabled={customers.length === 0}
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
