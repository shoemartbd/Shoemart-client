import CouponTable from "@/components/modules/Admin/Coupon/CouponTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coupon Management | Admin Dashboard",
  description: "Manage discount coupons for the store",
};

export default async function CouponManagementPage({
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
          <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
          <p className="text-muted-foreground text-sm">
            Manage promotional coupons and discount codes for store products
          </p>
        </div>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <CouponTable initialQueryString={initialQueryString} />
      </div>
    </div>
  );
}
