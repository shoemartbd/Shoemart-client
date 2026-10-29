import { Metadata } from "next";
import BlogTable from "./_components/BlogTable";

export const metadata: Metadata = {
  title: "Blog Management | Admin Dashboard",
  description: "Manage blog posts for your platform",
};

export default async function BlogManagementPage({
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
        <h2 className="text-3xl font-bold tracking-tight">Blog Management</h2>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <BlogTable initialQueryString={initialQueryString} />
      </div>
    </div>
  );
}
