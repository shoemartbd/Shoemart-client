import ProductTable from "@/components/modules/Admin/Product/ProductTable";
import Can from "@/components/shared/Can";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Products Management - Shoe Mart Admin",
  description: "Manage all products in the store",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const stringParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (value) {
      stringParams[key] = Array.isArray(value) ? value[0] : value;
    }
  }

  const initialQueryString = new URLSearchParams(stringParams).toString();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products Management</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage store inventory and listings
          </p>
        </div>
        <Can permission="product.create">
          <Button asChild className="rounded-xl shadow-lg">
            <Link href="/admin/dashboard/products/add">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </Can>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex bg-card rounded-xl border border-border shadow-sm p-4">
        <Suspense fallback={<div>Loading products...</div>}>
          <ProductTable initialQueryString={initialQueryString} />
        </Suspense>
      </div>
    </div>
  );
}
