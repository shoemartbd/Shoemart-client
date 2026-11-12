import { Metadata } from "next";
import MyWholesaleOrders from "./_components/MyWholesaleOrders";

export const metadata: Metadata = {
  title: "My Wholesale Orders | Dashboard",
  description: "Your wholesale requests, orders and invoices",
};

export default function MyWholesaleOrdersPage() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight">My Wholesale Orders</h2>
        <p className="text-muted-foreground">
          Your wholesale requests and orders. Open one to see its details or print the invoice.
        </p>
      </div>
      <MyWholesaleOrders />
    </div>
  );
}
