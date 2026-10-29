import ProfitLossReportView from "./_components/ProfitLossReportView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profit & Loss Report | Admin Dashboard",
  description: "Track sales, cost, expense and net profit for the store",
};

export default function ProfitLossReportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-black tracking-tight uppercase">
          Profit &amp; Loss Report
        </h2>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <ProfitLossReportView />
      </div>
    </div>
  );
}
