"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WholesaleRequestStatus } from "@/services/wholesaleRequest.services";
import { cn } from "@/lib/utils";

export const STATUSES: { value: WholesaleRequestStatus; label: string; tone: string }[] = [
  { value: "NEW", label: "New", tone: "bg-red-500/10 text-red-700 dark:text-red-400" },
  {
    value: "CONTACTED",
    label: "Contacted",
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  {
    value: "COMPLETED",
    label: "Sale Complete",
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  {
    value: "CLOSED",
    label: "Closed",
    tone: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  },
];

export const statusOf = (value: WholesaleRequestStatus) =>
  STATUSES.find((s) => s.value === value) ?? STATUSES[0];

// 017... -> 88017... for wa.me
export const whatsappHref = (phone: string) => `https://wa.me/88${phone}`;

export function StatusSelect({
  value,
  disabled,
  onChange,
}: {
  value: WholesaleRequestStatus;
  disabled?: boolean;
  onChange: (status: WholesaleRequestStatus) => void;
}) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(v) => onChange(v as WholesaleRequestStatus)}
    >
      <SelectTrigger className={cn("h-8 w-36 border-0 text-xs font-bold", statusOf(value).tone)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
