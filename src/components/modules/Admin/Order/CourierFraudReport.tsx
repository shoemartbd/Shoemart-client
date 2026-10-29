"use client";

import { cn } from "@/lib/utils";
import { getOrderFraudCheck } from "@/services/order.services";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import Image from "next/image";

interface ICourierStat {
  name: string;
  logo: string;
  total_parcel: number;
  success_parcel: number;
  cancelled_parcel: number;
  success_ratio: number;
}

interface ICourierCheckReport {
  id: string;
  name: string;
  details: string;
  created_at: string;
  courierLogo: string;
  courierName: string;
}

interface IFraudCheckData {
  hasPhone: boolean;
  phone?: string;
  report?: {
    data: Record<string, ICourierStat>;
    reports: ICourierCheckReport[];
  };
}

const ratioColor = (ratio: number) =>
  ratio >= 80 ? "text-green-600" : ratio >= 50 ? "text-amber-600" : "text-red-600";

const ratioBarColor = (ratio: number) =>
  ratio >= 80 ? "bg-green-500" : ratio >= 50 ? "bg-amber-500" : "bg-red-500";

const CourierFraudReport = ({ orderId, open }: { orderId: string; open: boolean }) => {
  const { data: fraudResponse, isLoading } = useQuery({
    queryKey: ["order-fraud-check", orderId],
    queryFn: () => getOrderFraudCheck(orderId),
    enabled: open && !!orderId,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const result: IFraudCheckData | undefined = fraudResponse?.success ? fraudResponse.data : undefined;

  return (
    <div className="space-y-2">
      <h3 className="font-black text-lg flex items-center gap-2">
        <ShieldCheck className="size-5 text-primary" />
        Courier Fraud Check
      </h3>

      <div className="bg-card p-4 rounded-xl border">
        {isLoading && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Checking delivery history...
          </p>
        )}

        {!isLoading && !fraudResponse?.success && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldQuestion className="size-4" />
            Could not fetch courier fraud report right now.
          </div>
        )}

        {!isLoading && fraudResponse?.success && result && !result.hasPhone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldQuestion className="size-4" />
            No valid phone number on this order to check.
          </div>
        )}

        {!isLoading && result?.hasPhone && result.report && (
          <FraudReportBody data={result.report.data} reports={result.report.reports} />
        )}
      </div>
    </div>
  );
};

const FraudReportBody = ({
  data,
  reports,
}: {
  data: Record<string, ICourierStat>;
  reports: ICourierCheckReport[];
}) => {
  const summary = data.summary;
  const couriers = Object.entries(data)
    .filter(([key, stat]) => key !== "summary" && stat.total_parcel > 0)
    .map(([key, stat]) => ({ key, ...stat }));

  const hasHistory = summary && summary.total_parcel > 0;
  const hasReports = reports.length > 0;

  const riskLabel = !hasHistory
    ? { text: "No History", icon: ShieldQuestion, className: "text-muted-foreground" }
    : hasReports
      ? { text: "Fraud Reported", icon: ShieldAlert, className: "text-red-600" }
      : summary.success_ratio >= 80
        ? { text: "Low Risk", icon: ShieldCheck, className: "text-green-600" }
        : summary.success_ratio >= 50
          ? { text: "Medium Risk", icon: AlertTriangle, className: "text-amber-600" }
          : { text: "High Risk", icon: ShieldAlert, className: "text-red-600" };

  return (
    <div className="space-y-4">
      {/* Overall summary */}
      <div className="flex items-center justify-between gap-4">
        <div className={cn("flex items-center gap-2 font-black", riskLabel.className)}>
          <riskLabel.icon className="size-5" />
          {riskLabel.text}
        </div>
        {hasHistory && (
          <span className="text-xs text-muted-foreground">
            {summary.total_parcel} total parcels across all couriers
          </span>
        )}
      </div>

      {hasHistory && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Overall success ratio</span>
            <span className={cn("font-bold", ratioColor(summary.success_ratio))}>
              {summary.success_ratio.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full", ratioBarColor(summary.success_ratio))}
              style={{ width: `${Math.min(100, summary.success_ratio)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{summary.success_parcel} delivered</span>
            <span>{summary.cancelled_parcel} cancelled</span>
          </div>
        </div>
      )}

      {/* Per-courier breakdown */}
      {couriers.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {couriers.map((courier) => (
            <div
              key={courier.key}
              className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-2.5"
            >
              <div className="flex items-center gap-1.5">
                <div className="relative size-5 shrink-0 overflow-hidden rounded">
                  <Image
                    src={courier.logo}
                    alt={courier.name}
                    fill
                    sizes="20px"
                    className="object-contain"
                  />
                </div>
                <span className="truncate text-xs font-bold">{courier.name}</span>
              </div>
              <span className={cn("text-sm font-black", ratioColor(courier.success_ratio))}>
                {courier.success_ratio.toFixed(0)}%
              </span>
              <span className="text-[10px] text-muted-foreground">
                {courier.success_parcel}/{courier.total_parcel} delivered
              </span>
            </div>
          ))}
        </div>
      )}

      {!hasHistory && (
        <p className="text-xs text-muted-foreground">
          This number has no prior delivery history with any tracked courier.
        </p>
      )}

      {/* Fraud reports */}
      {hasReports && (
        <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
          <div className="flex items-center gap-1.5 text-xs font-black text-red-600">
            <ShieldAlert className="size-3.5" />
            {reports.length} Fraud Report{reports.length > 1 ? "s" : ""}
          </div>
          {reports.map((r) => (
            <div key={r.id} className="text-xs text-red-700 dark:text-red-400">
              <span className="font-bold">{r.courierName}:</span> {r.details}
              <span className="ml-1 text-red-500">
                ({format(new Date(r.created_at), "MMM d, yyyy")})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourierFraudReport;
