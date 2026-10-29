import CustomerSegmentReportView from "./_components/CustomerSegmentReportView";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Customer Segments | Admin Dashboard",
  description:
    "Track New, Regular, and Loyal customer segments with filters and export",
};

export default function CustomerSegmentReportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-black tracking-tight uppercase">
          Customer Segments
        </h2>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <Suspense fallback={<div>Loading customer segment report...</div>}>
          <CustomerSegmentReportView />
        </Suspense>
      </div>
    </div>
  );
}
