import OrderTable from "@/components/modules/Admin/Order/OrderTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Landing Page Orders | Admin Dashboard",
  description: "Manage and track orders placed through landing page campaigns",
};

export default async function LandingPageOrderManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const queryParams = await searchParams;
  const stringParams: Record<string, string> = {};
  for (const key in queryParams) {
    const value = queryParams[key];
    if (Array.isArray(value)) {
      stringParams[key] = value[0];
    } else if (value !== undefined) {
      stringParams[key] = value as string;
    }
  }

  const initialQueryString = new URLSearchParams(stringParams).toString();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-black tracking-tight uppercase">
          Landing Page Orders
        </h2>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <OrderTable
          initialQueryString={initialQueryString}
          orderType="LANDING_PAGE"
          emptyMessage="No landing page orders found."
        />
      </div>
    </div>
  );
}
