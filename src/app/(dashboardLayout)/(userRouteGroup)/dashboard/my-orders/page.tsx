import UserOrderTable from "@/components/modules/User/Order/UserOrderTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders | Dashboard",
  description: "View and track your order history",
};

export default function MyOrdersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-black tracking-tight uppercase">
          My Order History
        </h2>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <UserOrderTable />
      </div>
    </div>
  );
}
