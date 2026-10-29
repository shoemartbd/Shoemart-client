"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSizeCharts } from "@/services/sizeChart.services";

// Radix Select can't hold an empty value, so "no size chart" uses this sentinel
const NO_SIZE_CHART = "none";

interface SizeChartSelectProps {
  value: string; // "" means no size chart
  onChange: (sizeChartId: string) => void;
}

export default function SizeChartSelect({ value, onChange }: SizeChartSelectProps) {
  const { data: sizeCharts = [] } = useQuery({
    queryKey: ["size-charts"],
    queryFn: () => getSizeCharts(),
  });

  return (
    <div className="space-y-2">
      <Label>Size Chart</Label>
      <Select
        value={value || NO_SIZE_CHART}
        onValueChange={(v) => onChange(v === NO_SIZE_CHART ? "" : v)}
      >
        <SelectTrigger className="w-full bg-background">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_SIZE_CHART}>No size chart</SelectItem>
          {sizeCharts.map((chart) => (
            <SelectItem key={chart.id} value={chart.id}>
              <span className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={chart.image}
                  alt=""
                  className="h-5 w-5 rounded object-cover bg-white"
                />
                {chart.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {sizeCharts.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No size charts yet.{" "}
          <Link
            href="/admin/dashboard/size-charts"
            target="_blank"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Add one
          </Link>
        </p>
      )}
    </div>
  );
}
