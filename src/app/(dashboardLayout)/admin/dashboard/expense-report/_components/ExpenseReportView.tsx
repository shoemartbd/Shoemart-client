"use client";

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
import StatsCard from "@/components/shared/StatsCard";
import { getExpenseReportSummary } from "@/services/expense.services";
import { IExpenseReportSummary } from "@/types/expense.types";

const CURRENT_COLOR = "#2a78d6";
const PREVIOUS_COLOR = "#eb6834";

const pctChange = (current: number, previous: number) => {
  if (previous <= 0) {
    return current > 0 ? "New expense vs last period" : "No change vs last period";
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}% vs last period`;
};

const fmt = (v: number) => `৳${Number(v || 0).toFixed(2)}`;

export default function ExpenseReportView() {
  const { data: summaryRes, isLoading } = useQuery({
    queryKey: ["expense-report-summary"],
    queryFn: () => getExpenseReportSummary(),
  });

  const summary: IExpenseReportSummary = summaryRes?.data || {
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
    allTime: 0,
  };

  const comparisonData = [
    { name: "Today", Current: summary.today, Previous: summary.yesterday },
    { name: "This Week", Current: summary.thisWeek, Previous: summary.lastWeek },
    { name: "This Month", Current: summary.thisMonth, Previous: summary.lastMonth },
  ];

  if (isLoading) {
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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
          description="Lifetime expenses"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Expenses: Current vs Previous Period
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
                <Bar dataKey="Current" fill={CURRENT_COLOR} radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="Previous" fill={PREVIOUS_COLOR} radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
