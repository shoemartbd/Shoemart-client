import AbandonedCheckoutTable from "@/components/modules/Admin/AbandonedCheckout/AbandonedCheckoutTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Incomplete Checkouts | Admin Dashboard",
  description: "Customers who started checkout but didn't complete their order",
};

export default async function AbandonedCheckoutsPage({
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
            Incomplete Checkouts
          </h2>
          <p className="text-sm text-muted-foreground">
            Visitors who reached checkout but didn&apos;t place an order —
            follow up to recover the sale
          </p>
        </div>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <AbandonedCheckoutTable initialQueryString={initialQueryString} />
      </div>
    </div>
  );
}
