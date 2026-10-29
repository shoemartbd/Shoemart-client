import OrderReturnsTable from "@/components/modules/Admin/OrderReturn/OrderReturnsTable";
import NewReturnButton from "@/components/modules/Admin/OrderReturn/NewReturnButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Returns | Admin Dashboard",
  description: "Manage returned items on your platform",
};

export default async function OrderReturnsPage({
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
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">
            Order Returns
          </h2>
          <p className="text-sm text-muted-foreground">Manage returned items</p>
        </div>
        <NewReturnButton />
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <OrderReturnsTable initialQueryString={initialQueryString} />
      </div>
    </div>
  );
}
