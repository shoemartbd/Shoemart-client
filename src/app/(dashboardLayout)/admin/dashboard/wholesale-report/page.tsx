import { Metadata } from "next";
import WholesaleReportView from "./_components/WholesaleReportView";

export const metadata: Metadata = {
  title: "Wholesale Report | Admin Dashboard",
  description: "Completed wholesale sales with cost, profit and due",
};

export default function WholesaleReportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-black tracking-tight uppercase">Wholesale Report</h2>
      </div>
      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <WholesaleReportView />
      </div>
    </div>
  );
}
