import CategoryTable from "@/components/modules/Admin/Category/CategoryTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Category Management | Admin Dashboard",
  description: "Manage product categories for your platform",
};

export default async function CategoryManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const queryParams = await searchParams;
  // Convert all values to strings
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
        <h2 className="text-3xl font-bold tracking-tight">
          Category Management
        </h2>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <CategoryTable initialQueryString={initialQueryString} />
      </div>
    </div>
  );
}
