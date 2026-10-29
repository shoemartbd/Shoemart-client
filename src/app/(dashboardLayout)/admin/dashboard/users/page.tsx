import UserTable from "@/components/modules/Admin/User/UserTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management | Admin Dashboard",
  description: "Manage system users, roles, and account statuses",
};

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const queryParams = await searchParams;
  
  // Convert all values to strings for search params
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
          User Management
        </h2>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <UserTable initialQueryString={initialQueryString} />
      </div>
    </div>
  );
}
