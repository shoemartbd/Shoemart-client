import { Metadata } from "next";
import WholesalerReportView from "./_components/WholesalerReportView";

export const metadata: Metadata = {
  title: "Wholesaler Report | Admin Dashboard",
  description: "What each wholesaler bought, when, how much they paid and what is due",
};

export default function WholesalerReportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Wholesaler Report</h2>
        <p className="text-muted-foreground">
          Completed wholesale sales per wholesaler account: what they bought, when, how much,
          and what is still due. Open a wholesaler to see every order.
        </p>
      </div>
      <WholesalerReportView />
    </div>
  );
}
