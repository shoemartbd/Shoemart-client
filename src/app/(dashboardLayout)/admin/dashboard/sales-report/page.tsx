import SalesReportView from "./_components/SalesReportView";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sales Report | Admin Dashboard",
  description: "Track delivered sales performance with filters and export",
};

export default function SalesReportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-black tracking-tight uppercase">
          Sales Report
        </h2>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <Suspense fallback={<div>Loading sales report...</div>}>
          <SalesReportView />
        </Suspense>
      </div>
    </div>
  );
}
