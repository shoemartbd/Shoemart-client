import { Metadata } from "next";
import WholesaleRequestsView from "./_components/WholesaleRequestsView";

export const metadata: Metadata = {
  title: "Wholesale Requests | Admin Dashboard",
  description: "Bulk order enquiries from the wholesale landing page",
};

export default function WholesaleRequestsPage() {
  return <WholesaleRequestsView />;
}
